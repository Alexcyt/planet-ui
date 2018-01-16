import { Layout } from 'antd';
import styles from "./MainFooter.css";

const { Footer } = Layout;

function MainFooter() {
  return (
    <Footer className={styles.footer}>
      以太星 ©2018 中科院计算所前瞻分布式实验室
    </Footer>
  );
}

export default MainFooter;
