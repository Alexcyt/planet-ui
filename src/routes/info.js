import { connect } from 'dva';
import { Button } from 'antd';
import config from '../../config/development.json';

const { metamaskUrl } = config;

function Info({ ...props }) {
  const { hasMetaMask, account, netId } = props;
  if (!hasMetaMask) {
    return (
      <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
        <h1>请使用chrome或firefox浏览器并安装MetaMask插件</h1>
        <Button type="primary" size="large" href={metamaskUrl}>安装MataMask</Button>
      </div>
    );
  } else if (!account) {
    return (
      <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
        <h1>请解锁你的MetaMask账号</h1>
      </div>
    );
  } else if (netId !== '1'){
    return (
      <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
        <h1>请选择正确的以太坊网络：Main Ethereum Network</h1>
      </div>
    );
  } else {
    return (
      <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
        <h1>欢迎使用以太星</h1>
      </div>
    );
  }
}

export default connect(state => state.user)(Info);
