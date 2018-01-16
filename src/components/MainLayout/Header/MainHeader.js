import React from 'react';
import { Layout, Menu } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './MainHeader.css';
import logo from '../../../assets/logo.png';

const { Header } = Layout;

class MainHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log(`first mount account: ${this.props.account}`);
  }

  componentDidUpdate() {
    const { account, netId }= this.props;
    console.log(`did update : ${account}; ${netId}`);
  }

  render() {
    const { tabIndex, hasMetaMask, account, netId }= this.props;
    const selectedKeys = [];
    if (tabIndex > 0) {
      selectedKeys.push(`${tabIndex}`);
    }

    let linkComp = (<Link to="#">登录</Link>);
    if (!hasMetaMask || !account) {
      linkComp = (<Link to="/info">登录</Link>);
    } else if (netId !== '1') {
      linkComp = (<Link to="/info">登录</Link>);
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
            <Link to="#">
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
}

export default connect(state => state.user)(MainHeader);
