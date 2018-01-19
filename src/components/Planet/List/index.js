import { Tabs, Input, Select } from 'antd';
import styles from './index.css';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const Option = Select.Option;

function handleChange(value) {
  console.log(`selected ${value}`);
}

const operations = (
  <Select defaultValue="排序" style={{ width: 120 }} onChange={handleChange}>
    <Option value="desc">最新的</Option>
    <Option value="asc">最早的</Option>
  </Select>
);

function PlanetList() {
  return (
    <div className={styles.listContainer}>
      <Search
        className={styles.searchBar}
        placeholder="请输入星星名称"
        onSearch={value => console.log(value)}
        size="large"
        style={{ width: 300 }}
      />
      <Tabs tabBarExtraContent={operations}>
        <TabPane tab="所有" key="1">Content of tab 1</TabPane>
        <TabPane tab="待售中" key="2">Content of tab 2</TabPane>
      </Tabs>
    </div>
  );
}

export default PlanetList;
