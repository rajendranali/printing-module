// src/hooks/useModules.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PAGE_SIZES } from '../utils/pageSizes';

const baseUrl = "http://localhost:3000/api/v1";

const useModules = () => {
  const [modules, setModules] = useState(() => {
    const savedModules = JSON.parse(sessionStorage.getItem("modules"));
    return savedModules || [{ id: 1, x: 10, y: 10, width: 200, height: 150, children: [] }];
  });
  const [activeModule, setActiveModule] = useState(null);
  const [nextId, setNextId] = useState(modules.length + 1);
  const [showAlignmentGuide, setShowAlignmentGuide] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [pageSize, setPageSize] = useState("A4");
  const [pageNumber, setPageNumber] = useState("page-1");
  const [orientation, setOrientation] = useState("Portrait");
  const [pagesizeOption, setPageSizeOption] = useState([]);
  const [mastercode, setMasterCode] = useState("");
  const [trntype, setTrnType] = useState([]);

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

    const updatedModules = modules.map((module) => resizeModule(module, pageWidth, pageHeight));
    setModules(updatedModules);
  };

  const resizeModule = (module, pageWidth, pageHeight) => {
    let newWidth = module.width;
    let newHeight = module.height;
    let newX = module.x;
    let newY = module.y;

    if (module.x + module.width > pageWidth * 3.77953) {
      newWidth = pageWidth * 3.77953 - module.x;
    }
    if (module.y + module.height > pageHeight * 3.77953) {
      newHeight = pageHeight * 3.77953 - module.y;
    }

    const resizedChildren = module.children.map(child => resizeModule(child, pageWidth, pageHeight));

    return {
      ...module,
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
      children: resizedChildren,
    };
  };

  const handleAddBox = (parentId = null) => {
    const newModule = {
      id: nextId,
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      children: [],
    };

    if (parentId) {
      const updatedModules = modules.map(module => {
        if (module.id === parentId) {
          return {
            ...module,
            children: [...module.children, newModule],
          };
        }
        return module;
      });
      setModules(updatedModules);
    } else {
      setModules([...modules, newModule]);
    }

    setNextId(nextId + 1);
    setActiveModule(newModule.id);
  };

  const handleFormatPage = () => {
    const { width, height } = PAGE_SIZES[pageSize];
    const pageWidth = orientation === "Landscape" ? height : width;
    const pageHeight = orientation === "Landscape" ? width : height;

    const formatModules = (module) => {
      let newWidth = (pageWidth / 2) * 3.77953;
      let newHeight = (pageHeight / 2) * 3.77953;
      return {
        ...module,
        width: newWidth,
        height: newHeight,
        children: module.children.map(formatModules),
      };
    };

    const formattedModules = modules.map(formatModules);
    setModules(formattedModules);
    setActiveModule(null);
  };

  const handleDragStop = (id, d) => {
    const updateModulePosition = (module, newPosition) => {
      if (module.id === id) {
        let { x, y } = newPosition;
        if (snapToGrid) {
          const gridSize = 10;
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
        }
        const maxX = PAGE_SIZES[pageSize].width * 3.77953 - module.width;
        const maxY = PAGE_SIZES[pageSize].height * 3.77953 - module.height;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        return { ...module, x, y };
      }
      return {
        ...module,
        children: module.children.map(child => updateModulePosition(child, newPosition)),
      };
    };

    const updatedModules = modules.map(module => updateModulePosition(module, { x: d.x, y: d.y }));
    setModules(updatedModules);
    setActiveModule(id);
  };

  const handleResizeStop = (id, direction, ref, delta, position) => {
    const updateModuleSize = (module, newSize, newPosition) => {
      if (module.id === id) {
        let { width, height } = newSize;
        let { x, y } = newPosition;

        if (snapToGrid) {
          const gridSize = 10;
          width = Math.round(width / gridSize) * gridSize;
          height = Math.round(height / gridSize) * gridSize;
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
        }

        const maxX = (PAGE_SIZES[pageSize].width / 2) * 3.77953 - width;
        const maxY = (PAGE_SIZES[pageSize].height / 2) * 3.77953 - height;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        width = Math.min(width, PAGE_SIZES[pageSize].width * 3.77953);
        height = Math.min(height, PAGE_SIZES[pageSize].height * 3.77953);

        return { ...module, width, height, x, y };
      }
      return {
        ...module,
        children: module.children.map(child => updateModuleSize(child, newSize, newPosition)),
      };
    };

    const updatedModules = modules.map(module => updateModuleSize(module, ref.style, position));
    setModules(updatedModules);
    setActiveModule(id);
  };

  const toggleAlignmentGuide = () => setShowAlignmentGuide(!showAlignmentGuide);
  const toggleSnapToGrid = () => setSnapToGrid(!snapToGrid);
  const toggleGrid = () => setShowGrid(!showGrid);

  const calculateAlignmentHighlight = (module) => {
    const alignmentThreshold = 10;
    let border = "1px solid #ddd";
    let outline = showAlignmentGuide ? "1px dashed #ccc" : "none";

    modules.forEach((otherModule) => {
      if (otherModule.id !== module.id) {
        if (Math.abs(otherModule.y - module.y) < alignmentThreshold) {
          module.y = otherModule.y;
        }
        if (Math.abs(otherModule.x - module.x) < alignmentThreshold) {
          module.x = otherModule.x;
        }
      }
    });

    border = module.x === 0 || module.y === 0 ? "2px solid red" : border;
    return { border, outline };
  };

  const handleDeleteModule = (id) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      const deleteModuleRecursively = (modules) => {
        return modules
          .filter(module => module.id !== id)
          .map(module => ({
            ...module,
            children: deleteModuleRecursively(module.children),
          }));
      };

      const updatedModules = deleteModuleRecursively(modules);
      setModules(updatedModules);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsFormat = () => {
    try {
      const formattedModules = JSON.stringify(modules);
      sessionStorage.setItem('savedFormat', formattedModules);
      alert('Format saved successfully.');
    } catch (err) {
      console.error("Error saving format:", err);
    }
  };

  return {
    modules,
    activeModule,
    nextId,
    showAlignmentGuide,
    snapToGrid,
    showGrid,
    pageSize,
    pageNumber,
    orientation,
    pagesizeOption,
    mastercode,
    trntype,
    handleAddBox,
    handleFormatPage,
    handleDragStop,
    handleResizeStop,
    toggleAlignmentGuide,
    toggleSnapToGrid,
    toggleGrid,
    calculateAlignmentHighlight,
    handleDeleteModule,
    handlePrint,
    handleSaveAsFormat,
    setModules,
    setActiveModule,
    setPageSize,
    setPageNumber,
    setOrientation,
    setMasterCode,
    setTrnType,
  };
};

export default useModules;
