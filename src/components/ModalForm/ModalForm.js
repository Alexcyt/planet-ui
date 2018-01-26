import { Modal} from 'antd';
import React from 'react';

class ModalForm extends React.Component {
  render() {
    const { FormComp, initialValue, getRef, ...rest } = this.props;
    return (
      <Modal
        {...rest}
        okText="保存"
        cancelText="取消"
      >
        <FormComp ref={getRef} initialValue={initialValue} />
      </Modal>
    );
  }
}

export default ModalForm;
