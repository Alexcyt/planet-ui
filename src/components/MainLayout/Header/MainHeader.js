import React from 'react';
import { Layout, Menu, notification } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './MainHeader.css';
import logo from '../../../assets/logo.png';
import { ACCOUNT_STATUS } from '../../../../constants/common';

const { Header } = Layout;

function MainHeader({ ...props }) {
  const { tabIndex, accountStatus }= props;
  const selectedKeys = [];
  if (tabIndex > 0) {
    selectedKeys.push(`${tabIndex}`);
  }

  let linkComp = null;
  switch (accountStatus) {
    case ACCOUNT_STATUS.NO_METAMASK:
    case ACCOUNT_STATUS.WRONG_NET:
    case ACCOUNT_STATUS.LOCKED_ACCOUNT:
      linkComp = (<Link to="/info">登录</Link>);
      break;
    case ACCOUNT_STATUS.UN_REGISTER:
      linkComp = (<Link to="/register">登录</Link>);
      break;
    case ACCOUNT_STATUS.HAS_LOGIN:
      linkComp = (<Link to="/me">我的星星</Link>);
      break;
    default:
      notification.error({
        message: '页面渲染出错',
        description: '未知的账号状态'
      });
      break;
  }

  return (
    <Header className={styles.header}>
      <Link to="/">
        <div className={styles.logo}>
          <img className={styles.logo_img} src={logo} alt={'以太星'} />
          <h1 className={styles.logo_name}>以太星</h1>
        </div>
      </Link>
      <Menu
        theme="dark"
        mode="horizontal"
        className={styles.menu}
        selectedKeys={selectedKeys}
      >
        <Menu.Item key="1">
          {linkComp}
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/market">
            星星市场
          </Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/about">
            关于
          </Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
}

export default connect(state => {
  return { accountStatus: state.user.accountStatus };
})(MainHeader);
