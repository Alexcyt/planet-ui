import React from 'react';
import { Form, Input, Tooltip, Icon, Button } from 'antd';
import { connect } from 'dva';
import style from './edit-profile.css';
import { ACCOUNT_STATUS } from "../../../constants/common";

const FormItem = Form.Item;

class EditProfileForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { dispatch, history } = this.props;
        const nickName = values.nickname.trim();
        const email = values.email.trim();
        if (!nickName && !email) {
          return;
        }
        const payload = {};
        if (nickName) {
          payload.nickName = nickName;
        }
        if (email) {
          payload.email = email;
        }

        dispatch({
          type: 'user/updateProfile',
          payload
        });

        history.push('/me');
      }
    });
  };

  render() {
    const { accountStatus, account, profile } = this.props;
    if (accountStatus !== ACCOUNT_STATUS.HAS_LOGIN || !account || !profile) {
      return (<h1>请先使用您的以太坊账户登录</h1>);
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
      <div align="center" className={style.editForm}>
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
            <Input disabled={true} value={account}/>
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
              rules: [
                { type: 'email', message: '邮箱格式不合法！' },
                { max: 50, message: '长度不要超过50个字符！' }
                ],
              initialValue: profile.email
            })(
              <Input/>
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
              rules: [
                { max: 50, message: '长度不要超过50个字符！' }
              ],
              initialValue: profile.nickName
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" size="large" htmlType="submit">提交修改</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedEditProfileForm = Form.create()(EditProfileForm);

function EditProfile({ ...props }) {
  return (
    <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
      <h1 align="center">修改信息</h1>
      <WrappedEditProfileForm {...props}/>
    </div>
  );
}

export default connect(state => state.user)(EditProfile);
