import React, { useEffect } from 'react';
import { Checkbox, Form, Input, Select } from 'antd';
import "./style.css"; // Ensure this CSS file includes the necessary styles

const { Option } = Select;

const ChildPanel = ({
  formData,
  setFormData,
  onSave,
  onClose,
}) => {
  
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      child: {
        title: prevData.child?.title || '',
        description: prevData.child?.description || '',
        type: prevData.child?.type || 'type1',
        hasChildren: prevData.child?.hasChildren || 0,
        fontsize: prevData.child?.fontsize || '',
        alignment: prevData.child?.alignment || 'center',
        bordercolor: prevData.child?.bordercolor || '1',
        borderwidth: prevData.child?.borderwidth || '1',
        textcolor: prevData.child?.textcolor || '1',
      }
    }));
  }, [setFormData, formData]);

  const handleChildChange = (key, value) => {
    setFormData(prevData => ({
      ...prevData,
      child: {
        ...prevData.child,
        [key]: value,
      }
    }));
  };

  const handleSubmit = () => {
    onSave();
  };

  return (
    <div className="form-wrapper">
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label={<span className="form-item-label">Child Title</span>}>
          <Input
            className="input-field"
            value={formData.child?.title || ''}
            onChange={(e) => handleChildChange('title', e.target.value)}
          />
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Child Description</span>}>
          <Input
            className="input-field"
            value={formData.child?.description || ''}
            onChange={(e) => handleChildChange('description', e.target.value)}
          />
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Child Type</span>}>
          <Select
            className="select-field"
            value={formData.child?.type || 'type1'}
            onChange={(value) => handleChildChange('type', value)}
          >
            <Option value="type1">Type 1</Option>
            <Option value="type2">Type 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Font Size</span>}>
          <Input
            className="input-field"
            value={formData.child?.fontsize || ''}
            onChange={(e) => handleChildChange('fontsize', e.target.value)}
          />
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Alignment</span>}>
          <Select
            className="select-field"
            value={formData.child?.alignment || 'center'}
            onChange={(value) => handleChildChange('alignment', value)}
          >
            <Option value="left">Left</Option>
            <Option value="center">Center</Option>
            <Option value="right">Right</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Border Color</span>}>
          <Select
            className="select-field"
            value={formData.child?.bordercolor || '1'}
            onChange={(value) => handleChildChange('bordercolor', value)}
          >
            <Option value="1">Color 1</Option>
            <Option value="2">Color 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Border Width</span>}>
          <Select
            className="select-field"
            value={formData.child?.borderwidth || '1'}
            onChange={(value) => handleChildChange('borderwidth', value)}
          >
            <Option value="1">Width 1</Option>
            <Option value="2">Width 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Text Color</span>}>
          <Select
            className="select-field"
            value={formData.child?.textcolor || '1'}
            onChange={(value) => handleChildChange('textcolor', value)}
          >
            <Option value="1">Color 1</Option>
            <Option value="2">Color 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label={<span className="form-item-label">Has Children</span>}>
          <Checkbox
            className="checkbox-wrapper"
            checked={formData.child?.hasChildren === 1}
            onChange={(e) =>
              handleChildChange('hasChildren', e.target.checked ? 1 : 0)
            }
          >
            Has Children
          </Checkbox>
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
    </div>
  );
};

export default ChildPanel;
