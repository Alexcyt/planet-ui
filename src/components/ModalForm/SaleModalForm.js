import { Form, Input, Row, Col } from 'antd';

const FormItem = Form.Item;

function checkPrice(rule, value, callback) {
  value = value.trim();
  if (!value) {
    callback('请填写星星的拍卖价格');
  } else if (!value.match(/^[\+-]?\d+(\.\d*)?$/)) {
    callback('价格必须为数字')
  } else if (Number(value) < 0) {
    callback('价格不能小于0');
  }
  callback();
}

function checkDuration(rule, value, callback) {
  value = value.trim();
  if (!value) {
    callback('请填写星星的拍卖持续时间');
  } else if (!value.match(/^\+?\d+?$/)) {
    callback('拍卖持续时间必须为正整数')
  } else if (Number(value) < 1) {
    callback('拍卖持续时间不能少于1天');
  } else if (Number(value) > 30) {
    callback('拍卖持续时间不能超过30天');
  }
  callback();
}

function SaleForm({ ...props }) {
  const { getFieldDecorator } = props.form;
  const formItemLayout = {
    labelCol: {
      xs: { span: 6 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 16 },
      sm: { span: 16 },
    },
  };

  return (
    <Form>
      <FormItem
        {...formItemLayout}
        label={(<span>起始价&nbsp;</span>)}
      >
        <Row>
          <Col span={20}>
            {getFieldDecorator('startPrice', {
              rules: [{ validator: checkPrice }]
            })(
              <Input/>
            )}
          </Col>
          <Col span={4}>
            &nbsp;&nbsp;&nbsp;ETH
          </Col>
        </Row>
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={(<span>截止价&nbsp;</span>)}
      >
        <Row>
          <Col span={20}>
            {getFieldDecorator('endPrice', {
              rules: [{ validator: checkPrice }]
            })(
              <Input/>
            )}
          </Col>
          <Col span={4}>
            &nbsp;&nbsp;&nbsp;ETH
          </Col>
        </Row>
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={(<span>持续时间&nbsp;</span>)}
      >
        <Row>
          <Col span={20}>
            {getFieldDecorator('duration', {
              rules: [{ validator: checkDuration }]
            })(
             <Input/>
            )}
          </Col>
          <Col span={4}>
            &nbsp;&nbsp;&nbsp;天
          </Col>
        </Row>
      </FormItem>
    </Form>
  );
}

const SaleModalFrom = Form.create()(SaleForm);
export default SaleModalFrom;
