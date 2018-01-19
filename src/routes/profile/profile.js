import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Tooltip, Row, Col, Button, notification } from 'antd';
import styles from './profile.css';
import copyToClipboard from 'copy-to-clipboard';
import { ACCOUNT_STATUS } from '../../../constants/common';
import * as userServise from '../../services/user';
import RETCODE from '../../../constants/ret-code';
import { errorProcess } from "../../utils/request";
import shallowEqual from 'shallowequal';
import queryString from 'querystring';

const ButtonGroup = Button.Group;

class Profile extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { showProfile: null };
  }

  getUserInfo = (walletAddr) => {
    if (!walletAddr) {
      return;
    }

    userServise.getUserInfo(walletAddr).then(resp => {
      if (resp.retCode !== RETCODE.SUCCESS) {
        throw errorProcess(resp);
      }
      this.setState({
        showProfile: {
          ...resp.data,
          account: walletAddr
        }
      });
    }).catch(err => {
      notification.error(err);
    });
  };

  componentDidMount() {
    const { accountStatus, account, profile, location } = this.props;

    let walletAddr = null;
    if (location.search) {
      const params = queryString.parse(location.search.substr(1));
      if (params && params.walletAddr) {
        walletAddr = params.walletAddr;
      }
    }

    if (accountStatus !== ACCOUNT_STATUS.HAS_LOGIN || !account || !profile) { // 未登录
      this.getUserInfo(walletAddr);
    } else { // 已登录
      if (location.pathname === '/me' || walletAddr === account) {
        this.setState({
          showProfile: {
            ...profile,
            account
          }
        });
      } else {
        this.getUserInfo(walletAddr);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const prevProps = this.props;
    if (shallowEqual(prevProps, nextProps)) {
      return;
    }
    const { accountStatus, account, profile, location } = nextProps;
    let walletAddr = null;
    if (location.search) {
      const params = queryString.parse(location.search.substr(1));
      if (params && params.walletAddr) {
        walletAddr = params.walletAddr;
      }
    }

    if (accountStatus !== ACCOUNT_STATUS.HAS_LOGIN || !account || !profile) { // 未登录
      this.getUserInfo(walletAddr);
    } else { // 已登录
      if (location.pathname === '/me' || walletAddr === account) {
        this.setState({
          showProfile: {
            ...profile,
            account
          }
        });
      } else {
        this.getUserInfo(walletAddr);
      }
    }
  }

  render() {
    const { showProfile } = this.state;
    if (!showProfile) {
      return (<div style={{background: '#fff', padding: 24, minHeight: 380}} />);
    }

    const { accountStatus, account } = this.props;
    let editComp = null;
    if (accountStatus === ACCOUNT_STATUS.HAS_LOGIN && account === showProfile.account) {
      editComp = (
        <Tooltip placement="bottom" title="编辑用户信息">
          <Link to="/edit-profile">
            <Button type="default" icon="edit" className={styles.userOperation}/>
          </Link>
        </Tooltip>
      );
    }

    return (
      <div style={{background: '#fff', padding: 24, minHeight: 380}}>
        <div>
          <Row type="flex" justify="start" align="middle">
            <Col span={2}>
              <div align="right">
                <img src={showProfile.headImg} alt="头像" className={styles.headImg}/>
              </div>
            </Col>
            <Col span={2}>
              <div className={styles.userInfo}>
                <h1>{showProfile.nickName}</h1>
                <ButtonGroup>
                  <Tooltip placement="bottom" title="复制账户地址">
                    <Button type="default" icon="copy" className={styles.userOperation} onClick={
                      () => copyToClipboard(showProfile.account)
                    }/>
                  </Tooltip>
                  {editComp}
                </ButtonGroup>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default connect(state => state.user)(Profile);
