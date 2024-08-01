import React, { useState } from "react";
import { Modal, Button, Input, Table, Form, Col, Row } from "antd";

const TableEditor = ({ visible, onClose, onSave, tableData }) => {
  const [columns, setColumns] = useState(tableData.columns || []);
  const [dataSource, setDataSource] = useState(tableData.rows || []);

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleRowChange = (index, field, value) => {
    const newData = [...dataSource];
    newData[index][field] = value;
    setDataSource(newData);
  };

  const handleAddColumn = () => {
    setColumns([...columns, { title: "New Header", key: `col_${columns.length}` }]);
  };

  const handleAddRow = () => {
    setDataSource([...dataSource, { key: `${dataSource.length}` }]);
  };

  const handleSave = () => {
    onSave({ columns, rows: dataSource });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      title="Edit Table"
      onCancel={onClose}
      onOk={handleSave}
    >
      <Form layout="vertical">
        <Row>
          <Col span={24}>
            <Button onClick={handleAddColumn}>Add Column</Button>
            <Button onClick={handleAddRow}>Add Row</Button>
          </Col>
        </Row>
        {columns.map((col, index) => (
          <Form.Item key={index} label={`Column ${index + 1}`}>
            <Input
              value={col.title}
              onChange={(e) => handleColumnChange(index, "title", e.target.value)}
              placeholder="Column Header"
            />
          </Form.Item>
        ))}
        {dataSource.map((row, index) => (
          <Form.Item key={index} label={`Row ${index + 1}`}>
            {columns.map((col, colIndex) => (
              <Input
                key={colIndex}
                value={row[col.key] || ''}
                onChange={(e) => handleRowChange(index, col.key, e.target.value)}
                placeholder={`Row ${index + 1} ${col.title}`}
              />
            ))}
          </Form.Item>
        ))}
      </Form>
      <Table
        columns={columns.map(col => ({ title: col.title, dataIndex: col.key, key: col.key }))}
        dataSource={dataSource}
        pagination={false}
        bordered
        size="small"
      />
    </Modal>
  );
};

export default TableEditor;




