import { Modal} from 'antd';
import React from 'react';

class ModalForm extends React.Component {
  render() {
    const { title, visible, confirmLoading, onOk, onCancel, FormComp, initialValue, width, getRef } = this.props;
    return (
      <Modal
        title={title}
        visible={visible}
        width={width}
        confirmLoading={confirmLoading}
        onOk={onOk}
        okText="保存"
        onCancel={onCancel}
        cancelText="取消"
      >
        <FormComp ref={getRef} initialValue={initialValue} />
      </Modal>
    );
  }
}

export default ModalForm;
