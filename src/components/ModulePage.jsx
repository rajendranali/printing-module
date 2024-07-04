import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { Modal, Button, Form, Input, Select, Checkbox } from "antd";
import axios from "axios";

const { Option } = Select;
const baseUrl="https://printing.sutradhar.tech/dev/backend/api/v1"

const ModulePage = () => {
  const [modules, setModules] = useState(() => {
    const savedModules = JSON.parse(sessionStorage.getItem("modules"));
    return savedModules || [{ id: 1, x: 10, y: 10, width: 200, height: 150 }];
  });
  const [activeModule, setActiveModule] = useState(null);
  const [nextId, setNextId] = useState(modules.length + 1);
  const [showAlignmentGuide, setShowAlignmentGuide] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [pageSize, setPageSize] = useState("A4");
  const [pageNumber, setPageNumber] = useState("page-1");
  const [orientation, setOrientation] = useState("Portrait");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoFormData, setInfoFormData] = useState({
    moduleId: null,
    info: "",
    type: "",
    isMultiple: false,
    border: "",
    pageNo: "",
  });
const [pagesizeOption,setPageSizeOption]=useState([])
  const previewRef = useRef();

  const PAGE_SIZES = {
    A4: { width: 211.5, height: 297 },
    A5: { width: 148.5, height: 210 },
    A6: { width: 105, height: 148.5 },
    A7: { width: 74.25, height: 105 },
  };
  
  const GRID_SIZE = 10;

  useEffect(() => {
    sessionStorage.setItem("modules", JSON.stringify(modules));
  }, [modules]);
  useEffect(() => {
    resizeModulesOnPageSizeChange();
  }, [pageSize, orientation]);
  
  const resizeModulesOnPageSizeChange = () => {
    const { width, height } = PAGE_SIZES[pageSize];
    const pageWidth = orientation === "Landscape" ? height : width;
    const pageHeight = orientation === "Landscape" ? width : height;
  
    const updatedModules = modules.map((module) => {
      let newWidth = module.width;
      let newHeight = module.height;
      let newX = module.x;
      let newY = module.y;
  
      // Adjust width and x position
      if (module.x + module.width > pageWidth * 3.77953) {
        newWidth = pageWidth * 3.77953 - module.x;
      }
      // Adjust height and y position
      if (module.y + module.height > pageHeight * 3.77953) {
        newHeight = pageHeight * 3.77953 - module.y;
      }
  
      return {
        ...module,
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      };
    });
  
    setModules(updatedModules);
  };
  

  const handleModuleClick = (id) => {
    setActiveModule(id === activeModule ? null : id);
  };

  const handleAddBox = () => {
    const newModule = {
      id: nextId,
      x: 50,
      y: 50,
      width: 200,
      height: 150,
    };
    setModules([...modules, newModule]);
    setNextId(nextId + 1);
    setActiveModule(newModule.id);
  };

  const handleFormatPage = () => {
    const { width, height } = PAGE_SIZES[pageSize];
    const pageWidth = orientation === "Landscape" ? height : width;
    const pageHeight = orientation === "Landscape" ? width : height;

    const formattedModules = modules.map((module) => ({
      ...module,
      width: (pageWidth / 2) * 3.77953, // Convert mm to px
      height: (pageHeight / 2) * 3.77953, // Convert mm to px
    }));
    setModules(formattedModules);
    setActiveModule(null);
  };
  const handleDragStop = (id, d) => {
    const updatedModules = modules.map((module) => {
      if (module.id === id) {
        let newX = d.x;
        let newY = d.y;
  
        if (snapToGrid) {
          const gridSize = GRID_SIZE;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }
  
        // Calculate the maximum allowed positions
        const maxX = (PAGE_SIZES[pageSize].width ) * 3.77953 - module.width;
        const maxY = (PAGE_SIZES[pageSize].height) * 3.77953 - module.height;
  
        // Ensure module stays within page boundaries
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
  
        return { ...module, x: newX, y: newY };
      }
      return module;
    });
  
    setModules(updatedModules);
    setActiveModule(id); // Keep the module active after dragging
  };
  
  const handleResizeStop = (id, direction, ref, delta, position) => {
    const updatedModules = modules.map((module) => {
      if (module.id === id) {
        let newWidth = parseInt(ref.style.width, 10);
        let newHeight = parseInt(ref.style.height, 10);
        let newX = position.x;
        let newY = position.y;
  
        if (snapToGrid) {
          const gridSize = GRID_SIZE;
          newWidth = Math.round(newWidth / gridSize) * gridSize;
          newHeight = Math.round(newHeight / gridSize) * gridSize;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }
  
        // Calculate the maximum allowed positions and sizes
        const maxX = (PAGE_SIZES[pageSize].width / 2) * 3.77953 - newWidth;
        const maxY = (PAGE_SIZES[pageSize].height / 2) * 3.77953 - newHeight;
  
        // Clamp newX and newY to stay within bounds
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
  
        // Clamp newWidth and newHeight to stay within bounds
        newWidth = Math.min(newWidth, PAGE_SIZES[pageSize].width * 3.77953);
        newHeight = Math.min(newHeight, PAGE_SIZES[pageSize].height * 3.77953);
  console.log("TYUHB",newWidth,modules,PAGE_SIZES,pageSize);
        return { ...module, width: newWidth, height: newHeight, x: newX, y: newY };
      }
      return module;
    });
  
    setModules(updatedModules);
    setActiveModule(id); // Keep the module active after resizing
  };
  
  
  

    
  const toggleAlignmentGuide = () => {
    setShowAlignmentGuide(!showAlignmentGuide);
  };

  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const calculateAlignmentHighlight = (module) => {
    const alignmentThreshold = 10; // Adjust as needed for snapping sensitivity
  
    let border = "1px solid #ddd";
    let outline = showAlignmentGuide ? "1px dashed #ccc" : "none";
  
    // Check alignment with other modules
    modules.forEach((otherModule) => {
      if (otherModule.id !== module.id) {
        // Snap to horizontal alignment
        if (Math.abs(otherModule.y - module.y) < alignmentThreshold) {
          module.y = otherModule.y;
        }
  
        // Snap to vertical alignment
        if (Math.abs(otherModule.x - module.x) < alignmentThreshold) {
          module.x = otherModule.x;
        }
      }
    });
  
    // Calculate border and outline styles based on alignment
    border = (module.x === 0 || module.y === 0) ? "2px solid red" : border;
  
    return {
      border,
      outline,
    };
  };
  

  const handleDeleteModule = (id) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      const updatedModules = modules.filter((module) => module.id !== id);
      setModules(updatedModules);
    }
  };

  const handlePrint = () => {
    const printContent = previewRef.current;
    const WindowPrt = window.open("", "", "width=600,height=400");
    WindowPrt.document.write(printContent.outerHTML);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  };

  const { width: pageWidth, height: pageHeight } = PAGE_SIZES[pageSize];
  const canvasWidth = orientation === "Landscape" ? pageHeight : pageWidth;
  const canvasHeight = orientation === "Landscape" ? pageWidth : pageHeight;

  const renderGrid = () => {
    const lines = [];
    for (let i = GRID_SIZE; i < canvasWidth * 3.77953; i += GRID_SIZE) {
      // Convert mm to px
      lines.push(
        <div
          key={`v-${i}`}
          style={{
            position: "absolute",
            top: 0,
            left: i,
            width: 1,
            height: "100%",
            backgroundColor: "#e0e0e0",
          }}
        />
      );
    }
    for (let j = GRID_SIZE; j < canvasHeight * 3.77953; j += GRID_SIZE) {
      // Convert mm to px
      lines.push(
        <div
          key={`h-${j}`}
          style={{
            position: "absolute",
            left: 0,
            top: j,
            height: 1,
            width: "100%",
            backgroundColor: "#e0e0e0",
          }}
        />
      );
    }
    return lines;
  };

  const handleModuleDoubleClick = (id) => {
    const module = modules.find((m) => m.id === id);
    setInfoFormData({
      moduleId: id,
      info: module.info || "",
      type: module.type || "",
      isMultiple: module.isMultiple || false,
      border: module.border || "",
      pageNo: module.pageNo || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveInfo = () => {
    const updatedModules = modules.map((module) =>
      module.id === infoFormData.moduleId
        ? {
            ...module,
            info: infoFormData.info,
            type: infoFormData.type,
            isMultiple: infoFormData.isMultiple,
            border: infoFormData.border,
            pageNo: infoFormData.pageNo,
          }
        : module
    );
    setModules(updatedModules);
    setIsModalOpen(false);
  };

  const handleSaveAsFormat = async () => {
    const payload = {};

    let resp = await axios.post("hi", payload).then((r) => {}).catch((err) => {
      console.log(err);
    });
  };

  useEffect(()=>{
const FetchPagesize=async()=>{
  await axios.post(`${baseUrl}/filterpagetype/`).then((r)=>{
    console.log(r);
    setPageSizeOption(r.data.Message)
  }).catch((err)=>console.log(err))
}
FetchPagesize()
  },[])
  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          alignItems: "center",
        }}
      >
        <Select
          value={pageSize}
          onChange={(value) => setPageSize(value)}
          style={{ width: 120 }}
        >
          {pagesizeOption?.map((item)=>{
            return <Option value={item.descn}>{item?.descn}</Option>
          }
          )}
          
          
        </Select>
        <Select
          value={pageNumber}
          onChange={(value) => setPageNumber(value)}
          style={{ width: 120 }}
        >
          <Option value="page-1">Page 1</Option>
          <Option value="page-2">Page 2</Option>
          <Option value="page-3">Page 3</Option>
        </Select>
        <Select
          value={orientation}
          onChange={(value) => setOrientation(value)}
          style={{ width: 120 }}
        >
          <Option value="Portrait">Portrait</Option>
          <Option value="Landscape">Landscape</Option>
        </Select>
        <Button type="primary" onClick={handleAddBox}>
          Add Box
        </Button>
        <Button onClick={handleFormatPage}>Format Page</Button>
        <Button onClick={toggleAlignmentGuide}>
          Toggle Alignment Guide
        </Button>
        <Button onClick={toggleSnapToGrid}>
          {snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
        </Button>
        <Button onClick={toggleGrid}>
          {showGrid ? "Hide Grid" : "Show Grid"}
        </Button>
        <Button onClick={handlePrint}>Preview</Button>
        <Button type="primary" onClick={handleSaveAsFormat}>
          Save As Format
        </Button>
      </div>

      <div
        ref={previewRef}
        style={{
          width: canvasWidth * 3.77953,
          height: canvasHeight * 3.77953,
          position: "relative",
          border: "1px solid #000",
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {showGrid && renderGrid()}
          {modules.map((module, index) => (
            <Rnd
              key={module.id}
              size={{ width: module.width, height: module.height }}
              position={{ x: module.x, y: module.y }}
              onDragStop={(e, d) => handleDragStop(module.id, d)}
              onResizeStop={(e, direction, ref, delta, position) =>
                handleResizeStop(module.id, direction, ref, delta, position)
              }
              onDoubleClick={() => handleModuleDoubleClick(module.id)}
              style={{
                border: "1px solid #ddd",
                background:
                  activeModule === module.id ? "#e0f7fa" : "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                resize: "both",
                overflow: "hidden",
                zIndex: index + 1,
                ...calculateAlignmentHighlight(module),
              }}
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              onClick={() => handleModuleClick(module.id)}
            >
              <div style={{ fontSize: "20px", position: "relative" }}>
                Module {module.id}
                <span
                  style={{
                    fontSize: "12px",
                    marginLeft: "5px",
                    color: "#666",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteModule(module.id);
                  }}
                >
                  (Delete)
                </span>
                {module.info && (
                  <span
                    style={{
                      fontSize: "12px",
                      marginLeft: "5px",
                      color: "#666",
                    }}
                  >
                    - {module.info}
                  </span>
                )}
              </div>
            </Rnd>
          ))}
          {showAlignmentGuide && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: canvasWidth * 3.77953 / 2,
                  top: 0,
                  width: 1,
                  height: "100%",
                  borderLeft: "1px dotted #ccc",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: canvasHeight * 3.77953 / 2,
                  left: 0,
                  width: "100%",
                  height: 1,
                  borderTop: "1px dotted #ccc",
                }}
              />
            </>
          )}
        </div>
      </div>
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInfo}
        formData={infoFormData}
        setFormData={setInfoFormData}
      />
    </div>
  );
};



const InfoModal = ({ isOpen, onClose, onSave, formData, setFormData }) => {
  useEffect(() => {
    if (isOpen) {
      // Initialize form data with default or existing values
      setFormData({
        mastercode: '',
        trntype: '1', // Example: Default value for dropdown
        textwrap: '1', // Example: Default value for dropdown
        fontsize: '',
        texttype: '1', // Example: Default value for dropdown
        alignment: 'center', // Example: Default value for dropdown
        box: '1', // Example: Default value for dropdown
        bordercolor: '1', // Example: Default value for dropdown
        borderwidth: '1', // Example: Default value for dropdown
        textcolor: '1', // Example: Default value for dropdown
        hasChildren: 0,
        xcoord: '',
        ycoord: '',
        pagetype: 1,
        height: '',
        width: '',
        apikey: '1', // Example: Default value for input
        // Add more fields as needed
      });
    }
  }, [isOpen, setFormData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Modal
      title="Edit Module Info"
      visible={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <Form.Item label="Master Code">
          <Input
            value={formData.mastercode}
            onChange={(e) => setFormData({ ...formData, mastercode: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Transaction Type">
          <Select
            value={formData.trntype}
            onChange={(value) => setFormData({ ...formData, trntype: value })}
          >
            <Option value="1">Type 1</Option>
            <Option value="2">Type 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Text Wrap">
          <Select
            value={formData.textwrap}
            onChange={(value) => setFormData({ ...formData, textwrap: value })}
          >
            <Option value="1">Wrap 1</Option>
            <Option value="2">Wrap 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Text Type">
          <Select
            value={formData.texttype}
            onChange={(value) => setFormData({ ...formData, texttype: value })}
          >
            <Option value="1">Type 1</Option>
            <Option value="2">Type 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Alignment">
          <Select
            value={formData.alignment}
            onChange={(value) => setFormData({ ...formData, alignment: value })}
          >
            <Option value="left">Left</Option>
            <Option value="center">Center</Option>
            <Option value="right">Right</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Box">
          <Select
            value={formData.box}
            onChange={(value) => setFormData({ ...formData, box: value })}
          >
            <Option value="1">Box 1</Option>
            <Option value="2">Box 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Has Children">
          <Checkbox
            checked={formData.hasChildren === 1}
            onChange={(e) => setFormData({ ...formData, hasChildren: e.target.checked ? 1 : 0 })}
          >
            Has Children
          </Checkbox>
        </Form.Item>
        <Form.Item label="API Key">
          <Input
            value={formData.apikey}
            onChange={(e) => setFormData({ ...formData, apikey: e.target.value })}
          />
        </Form.Item>
        {/* Add more Form.Item components for other fields */}
      </Form>
    </Modal>
  );
};


export default ModulePage;
