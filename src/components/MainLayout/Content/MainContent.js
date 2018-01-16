import { Layout } from 'antd';
import styles from "./MainContent.css";

const { Content } = Layout;

function MainContent({ Comp, ...rest }) {
  return (
    <Content className={styles.content}>
      <Comp {...rest} />
    </Content>
  );
}

export default MainContent;
