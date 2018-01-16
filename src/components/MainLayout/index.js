import React from 'react';
import { Layout } from 'antd';
import MainHeader from './Header/MainHeader';
import MainContent from './Content/MainContent';
import MainFooter from './Footer/MainFooter';

function MainLayout({ Comp, ...rest }) {
  return (
    <Layout>
      <MainHeader {...rest}/>
      <MainContent {...rest} Comp={Comp}/>
      <MainFooter/>
    </Layout>
  );
}

export default MainLayout;
