import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import MainLayout from './components/MainLayout';
import IndexPage from './routes/IndexPage';
import About from './routes/about';
import Info from './routes/info';

const routes = [
  {
    path: '/',
    exact: true,
    component: IndexPage
  },
  {
    path: '/about',
    component: About,
    tabIndex: 3
  },
  {
    path: '/info',
    component: Info,
  }
];

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        {
          routes.map(({ path, exact, component: Comp, tabIndex = 0 }) => (
            <Route path={path} exact={exact} render={(props) => (
              <MainLayout {...props} Comp={Comp} tabIndex={tabIndex} />
            )}/>
          ))
        }
      </Switch>
    </Router>
  );
}

export default RouterConfig;
