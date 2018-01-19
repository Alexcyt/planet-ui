import { connect } from 'dva';
import { Button, notification } from 'antd';
import config from '../../config/default.json';
import { ACCOUNT_STATUS } from '../../constants/common';

const { metamaskUrl } = config;

function Info({ ...props }) {
  const { accountStatus } = props;
  let showComp = null;
  switch (accountStatus) {
    case ACCOUNT_STATUS.NO_METAMASK:
      showComp = (
        <div>
          <h1>请使用chrome或firefox浏览器并安装MetaMask插件</h1>
          <Button type="primary" size="large" href={metamaskUrl}>安装MataMask</Button>
        </div>
      );
      break;
    case ACCOUNT_STATUS.WRONG_NET:
      showComp = (
        <div>
          <h1>请选择正确的以太坊网络</h1>
        </div>
      );
      break;
    case ACCOUNT_STATUS.LOCKED_ACCOUNT:
      showComp = (
        <div>
          <h1>请解锁你的MetaMask账号</h1>
        </div>
      );
      break;
    case ACCOUNT_STATUS.UN_REGISTER:
      showComp = (
        <div>
          <h1>请先使用MetaMask钱包插件注册以太坊账号</h1>
        </div>
      );
      break;
    case ACCOUNT_STATUS.HAS_LOGIN:
      showComp = (
        <div>
          <h1>欢迎使用以太星</h1>
        </div>
      );
      break;
    default:
      notification.error({
        message: '页面渲染出错',
        description: '未知的账号状态'
      });
      break;
  }

  return (
    <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
      {showComp}
    </div>
  );
}

export default connect(state => {
  return { accountStatus: state.user.accountStatus};
})(Info);
