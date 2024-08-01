import React, { useEffect } from 'react';
import { Checkbox, Form, Input, Select } from 'antd';
import ChildPanel from './ChildPanel';
import "./style.css"
const { Option } = Select;

const SidePanel = ({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  trntype,
}) => {
  console.log("formData",formData)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...formData,
        mastercode: formData.mastercode || '',
        trntype: formData.trntype || '1',
        textwrap: formData.textwrap || '1',
        fontsize: formData.fontsize || '',
        texttype: formData.texttype || '1',
        alignment: formData.alignment || 'center',
        box: formData.box || '1',
        bordercolor: formData.bordercolor || '1',
        borderwidth: formData.borderwidth || '1',
        textcolor: formData.textcolor || '1',
        hasChildren: formData.hasChildren || 0,
        xcoord: formData.x || '',
        ycoord: formData.y || '',
        pagetype: formData.pagetype || 1,
        height: formData.height || '',
        width: formData.width || '',
        apikey: formData.apikey || '1',
        title: '',
        caption: '',
      });
    }
  }, [isOpen, setFormData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <>
    
      <Form className="form-wrapper" layout="vertical" onSubmit={handleSubmit}>
        <Form.Item label={<span className="form-item-label">Transaction Type</span>}>
          <Select
            className="select-field"
            value={formData.trntype}
            onChange={(value) => setFormData({ ...formData, trntype: value })}
          >
            <Option value="1">Type 1</Option>
            <Option value="2">Type 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Text Wrap</span>}>
          <Select
            className="select-field"
            value={formData.textwrap}
            onChange={(value) => setFormData({ ...formData, textwrap: value })}
          >
            <Option value="1">Yes</Option>
            <Option value="0">No</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Text Type</span>}>
          <Select
            className="select-field"
            value={formData.texttype}
            onChange={(value) => setFormData({ ...formData, texttype: value })}
          >
            {trntype.map((r) => (
              <Option key={r.recno} value={r.recno}>
                {r.descn}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Alignment</span>}>
          <Select
            className="select-field"
            value={formData.alignment}
            onChange={(value) => setFormData({ ...formData, alignment: value })}
          >
            <Option value="left">Left</Option>
            <Option value="center">Center</Option>
            <Option value="right">Right</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Font Size</span>}>
          <Input
            className="input-field"
            value={formData.fontsize}
            onChange={(e) => setFormData({ ...formData, fontsize: e.target.value })}
          />
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Box</span>}>
          <Select
            className="select-field"
            value={formData.box}
            onChange={(value) => setFormData({ ...formData, box: value })}
          >
            <Option value="1">Box 1</Option>
            <Option value="2">Box 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Has Children</span>}>
          <Checkbox
            className="checkbox-wrapper"
            checked={formData.hasChildren === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                hasChildren: e.target.checked ? 1 : 0,
              })
            }
          >
            Has Children
          </Checkbox>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Title</span>}>
          <Input
            className="input-field"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Caption</span>}>
          <Input
            className="input-field"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
          />
        </Form.Item>
        <Form.Item className="action-buttons">
          <button type="submit" className="ant-btn ant-btn-primary">
            Save
          </button>
          <button type="button" className="ant-btn" onClick={onClose}>
            Cancel
          </button>
        </Form.Item>
      </Form>
      {formData.hasChildren === 1 && (
        <ChildPanel
          formData={formData}
          setFormData={setFormData}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default SidePanel;
