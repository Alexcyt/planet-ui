import { Form, Input } from 'antd';

const FormItem = Form.Item;

function NameForm({ ...props }) {
  const { initialValue } = props;
  const { getFieldDecorator } = props.form;
  const formItemLayout = {
    labelCol: {
      xs: { span: 6 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 17 },
      sm: { span: 17 },
    },
  };

  return (
    <Form>
      <FormItem
        {...formItemLayout}
        label={(<span>自定义命名&nbsp;</span>)}
      >
        {getFieldDecorator('customName', {
          rules: [
            { required: true, message: '请填写您给星星的命名！' },
            { max: 50, message: '长度不要超过50个字符！' }
            ],
          initialValue: initialValue.customName
        })(
          <Input/>
        )}
      </FormItem>
    </Form>
  );
}

const PlanetNameForm = Form.create()(NameForm);
export default PlanetNameForm;
