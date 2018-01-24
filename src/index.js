import dva from 'dva';
import { notification } from 'antd';
import browserHistory from 'history/createBrowserHistory';
import './index.css';

// 1. Initialize
const app = dva({
  history: browserHistory(),
  onError(e) {
    const showErr = {
      message: e.message || '出错啦！',
      description: e.description || '网络错误'
    };
    notification.error(showErr);
    e.preventDefault();
  }
});

// 2. Plugins
// app.use({});

// 3. Model
app.model(require('./models/user').default);
app.model(require('./models/planet').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
