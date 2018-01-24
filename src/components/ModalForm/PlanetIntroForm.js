import { Form, Input } from 'antd';

const FormItem = Form.Item;
const { TextArea } = Input;

function IntroForm({ ...props }) {
  const { initialValue } = props;
  const { getFieldDecorator } = props.form;
  const formItemLayout = {
    labelCol: {
      xs: { span: 5 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 18 },
      sm: { span: 18 },
    },
  };

  return (
    <Form>
      <FormItem
        {...formItemLayout}
        label={(<span>自定义简介&nbsp;</span>)}
      >
        {getFieldDecorator('customIntro', {
          rules: [
            { required: true, message: '请填写您给星星的介绍！' },
            { max: 500, message: '长度不要超过500个字符！' }
            ],
          initialValue: initialValue.customIntro
        })(
          <TextArea rows={8}/>
        )}
      </FormItem>
    </Form>
  );
}

const PlanetIntroForm = Form.create()(IntroForm);
export default PlanetIntroForm;
