import React from 'react';
import { Tabs, Input, Select, List, Avatar, Tooltip, Icon, Spin } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './index.css';
import shallowEqual from 'shallowequal';
import moment from 'moment';
import { getCurrentPrice } from '../../utils/price';
import ethIcon from '../../assets/eth.png';

moment.locale('zh-cn');

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const Option = Select.Option;

class PlanetList extends React.PureComponent {
  constructor(props) {
    super(props);
    const query = {};
    if (props.walletAddr) {
      query.walletAddr = props.walletAddr;
    }
    this.state = { query };
  }

  handleOrderChange = (value) => {
    this.setState({
      query: {
        ...this.state.query,
        order_direction: value
      }
    });
  };

  handleTabChange = (activeKey) => {
    this.setState({
      query: {
        ...this.state.query,
        forSale: activeKey === 'forSale'
      }
    });
  };

  handleSearch = (value) => {
    value = value || '';
    if (value) {
      value = value.trim();
      this.setState({
        query: {
          ...this.state.query,
          search: value
        }
      });
    } else {
      const query = { ...this.state.query };
      delete query.search;
      this.setState({ query });
    }
  };

  handleChangePage = (page) => {
    this.setState({
      query: {
        ...this.state.query,
        page
      }
    });
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'planet/fetchList',
      payload: { query }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { walletAddr } = this.props;
    const { query } = this.state;
    if (nextProps.walletAddr !== walletAddr) {
      this.setState({
        query: {
          ...query,
          walletAddr: nextProps.walletAddr
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { dispatch } = this.props;
    const { query } = this.state;
    if (!shallowEqual(prevState.query, query)) {
      dispatch({
        type: 'planet/fetchList',
        payload: { query }
      });
    }
  }

  getListItemContent = (planet) => {
    let nameComp = null;
    if (planet.englishName || planet.chineseName || planet.customName) {
      nameComp = (
        <div>
          <strong>名称：</strong>
          {planet.customName || planet.chineseName || planet.englishName}
        </div>
      );
    }

    const timeComp = (
      <div>
        <strong>发布时间：</strong>
        {moment(planet.discoverTime).format('llll')}
      </div>
    );


    const ownerComp = (
      <div>
        <strong>所有者：</strong>
        <Link to={`/profile?walletAddr=${planet.owner.walletAddr}`}>
          {planet.owner.nickName}
        </Link>
      </div>
    );

    let stateComp = null;
    if (planet.auction) {
      stateComp = (
        <div>
          <strong>状态：</strong>
          在售中&nbsp;<img src={ethIcon} alt="" style={{ height: '20px' }} />
          {getCurrentPrice(planet.auction)} ETH
        </div>
      );
    }

    return (
      <div>
        {nameComp}
        {timeComp}
        {ownerComp}
        {stateComp}
      </div>
    );
  };

  render() {
    const { list, pagination, loading } = this.props;

    const operations = (
      <Select
        defaultValue="排序"
        style={{ width: 120 }}
        onChange={this.handleOrderChange}
      >
        <Option value="desc">最新的</Option>
        <Option value="asc">最早的</Option>
      </Select>
    );

    let tabContents = [
      <div align="center"><Spin size="large"/></div>,
      <div align="center"><Spin size="large"/></div>
    ];

    if (!loading) {
      tabContents = [
        (<h1>没有星星...</h1>),
        (<h1>没有星星...</h1>)
      ];
      if (list.length > 0 && pagination) {
        const page = {
          pageSize: pagination.pageSize,
          current: pagination.page,
          total: pagination.rowCount,
          onChange: this.handleChangePage
        };

        const { query } = this.state;
        let tabIdx = 0;
        if (query.forSale) {
          tabIdx = 1;
        }

        tabContents[tabIdx] = (
          <List
            grid={{ gutter: 48, column: 2 }}
            className={styles.list}
            itemLayout="vertical"
            size="large"
            pagination={page}
            dataSource={list}
            renderItem={planet => (
              <List.Item
                key={planet.planetNo}
                extra={
                  <Link to={`/planet?planetNo=${planet.planetNo}`}>
                    <img width={200} alt={`planet-${planet.planetNo}`} src={planet.img} />
                  </Link>
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={planet.owner.headImg} />}
                  title={
                    <Link to={`/planet?planetNo=${planet.planetNo}`} style={{ fontSize: '1.5rem' }}>
                      星星#{planet.planetNo}
                    </Link>
                  }
                  description={
                    <span>
                    <h3 style={{ color: 'grey' }}>
                      位于：{planet.location}
                      &nbsp;
                      <Tooltip placement="right" title="星星坐标，可以使用Google Earth查看该星星">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </h3>
                  </span>
                  }
                />
                {this.getListItemContent(planet)}
              </List.Item>
            )}
          />
        );
      }
    }

    return (
      <div className={styles.listContainer}>
        <Search
          className={styles.searchBar}
          placeholder="请输入星星名称或编号"
          onSearch={this.handleSearch}
          size="large"
          style={{ width: 300 }}
          enterButton
        />
        <Tabs tabBarExtraContent={operations} onChange={this.handleTabChange}>
          <TabPane tab="所有" key="all">{tabContents[0]}</TabPane>
          <TabPane tab="待售中" key="forSale">{tabContents[1]}</TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect(state => {
  return {
    list: state.planet.list,
    pagination: state.planet.pagination,
    loading: state.loading.models.planet
  };
})(PlanetList);
