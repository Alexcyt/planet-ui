import React from 'react';
import { Form, Input, Tooltip, Icon, Button } from 'antd';
import { connect } from 'dva';
import style from './index.css';
import { ACCOUNT_STATUS } from "../../../constants/common";

const FormItem = Form.Item;

class RegistrationForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { dispatch, history } = this.props;
        const nickName = values.nickname.trim();
        dispatch({
          type: 'user/register',
          payload: {
            walletAddr: values.account,
            email: values.email,
            nickName
          }
        });

        history.push('/me');
      }
    });
  };

  render() {

    const { account, accountStatus } = this.props;
    if (accountStatus !== ACCOUNT_STATUS.UN_REGISTER || !account) {
      return (<h1>请先通过MetaMask钱包插件注册以太坊账户</h1>);
    }
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 4, offset: 4 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 10 },
      },
    };

    return (
      <div align="center" className={style.registerForm}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
                账户地址&nbsp;
                <Tooltip title="您的以太坊账户地址，作为您账户的唯一标识">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            )}
          >
            {getFieldDecorator('account', {
              rules: [{
                required: true, message: '请填写以太坊账户地址！',
              }],
              initialValue: account
            })(
              <Input disabled={true}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
                邮箱&nbsp;
                <Tooltip title="只是用来与您联系的方式，不作为账号标识">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            )}
          >
            {getFieldDecorator('email', {
              rules: [{
                type: 'email', message: '邮箱格式不合法！',
              }, {
                required: true, message: '请填写正确邮箱！',
              }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
                昵称&nbsp;
                <Tooltip title="你希望别人怎么称呼您？">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            )}
          >
            {getFieldDecorator('nickname', {
              rules: [{ required: true, message: '请填写您的昵称', whitespace: true }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" size="large" htmlType="submit">注册</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);

function Register({ ...props }) {
  return (
    <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
      <h1 align="center">注册</h1>
      <WrappedRegistrationForm {...props}/>
    </div>
  );
}

export default connect(state => {
  return {
    account: state.user.account,
    accountStatus: state.user.accountStatus
  };
})(Register);
