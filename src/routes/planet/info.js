import React from 'react';
import { Link } from 'dva/router';
import { connect } from 'dva';
import { Row, Col, Tooltip, Button, Icon, Avatar, notification, Spin } from 'antd';
import queryString from 'querystring';
import { ACCOUNT_STATUS } from "../../../constants/common";
import styles from './info.css';
import { getCurrentPrice, getPriceStr, getCurrentPriceIntStr, toWei } from '../../utils/price';
import ethIcon from '../../assets/eth.png';
import moment from 'moment';
import ModalForm from '../../components/ModalForm/ModalForm';
import PlanetNameForm from '../../components/ModalForm/PlanetNameForm';
import PlanetIntroForm from '../../components/ModalForm/PlanetIntroForm';
import SaleModalFrom from '../../components/ModalForm/SaleModalForm';

moment.locale('zh-cn');

const isMine = (planet, user) => {
  return (user && user.accountStatus === ACCOUNT_STATUS.HAS_LOGIN && user.account === planet.owner.walletAddr);
};

const getTimeLeft = (auction) => {
  const now = (new Date()).getTime();
  const startAt = (new Date(auction.createTime)).getTime();
  const endAt = startAt + auction.duration * 1000;
  if (now >= endAt) {
    return null;
  }
  const endTime = moment(endAt);
  return moment(now).to(endTime);
};

const getRect = (auction) => {
  const startAt = (new Date(auction.createTime)).getTime();
  const duration = auction.duration;
  const now = (new Date()).getTime();
  let secondsPassed = 0;
  if (now > startAt) {
    secondsPassed = (now - startAt) / 1000;
  }

  const startPrice = Number.parseFloat(auction.startPrice);
  const endPrice = Number.parseFloat(auction.endPrice);
  let currentPrice = null;
  if (secondsPassed >= duration) {
    currentPrice = auction.endPrice;
    secondsPassed = duration;
  } else {
    currentPrice = (endPrice - startPrice) / duration * secondsPassed + startPrice;
  }

  const rectLeftTop = { x: 5, y: 5 };
  const rectRightBottom = { x: 715, y: 175 };
  const width = rectRightBottom.x - rectLeftTop.x;
  const height = rectRightBottom.y - rectLeftTop.y;
  const vLine1 = {
    x1: rectLeftTop.x + width / 3,
    y1: rectLeftTop.y,
    x2: rectLeftTop.x + width / 3,
    y2: rectRightBottom.y
  };
  const vLine2 = {
    x1: rectLeftTop.x + 2 * width / 3,
    y1: rectLeftTop.y,
    x2: rectLeftTop.x + 2 * width / 3,
    y2: rectRightBottom.y
  };
  const currentX = rectLeftTop.x + secondsPassed / duration * width;

  let start = null;
  let end = null;
  let current = null;
  if (startPrice > endPrice) {
    start = rectLeftTop;
    end = rectRightBottom;
    const currentY = start.y + height * (startPrice - currentPrice) / (startPrice - endPrice);
    current = { x: currentX, y: currentY };
  } else {
    start = { x: rectLeftTop.x, y: rectRightBottom.y };
    end = { x: rectRightBottom.x, y: rectLeftTop.y };
    const currentY = start.y - height * (currentPrice - startPrice) / (endPrice - startPrice);
    current = { x: currentX, y: currentY };
  }

  return (
    <svg viewBox="0 0 720 180">
      <defs>
        <linearGradient x2="0" y2="1">
          <stop offset="0" stopColor="#f5eae2" stopOpacity="0.4"></stop>
          <stop offset="1" stopColor="#fff"></stop>
        </linearGradient>
      </defs>
      <polygon
        points={`${rectRightBottom.x},${rectRightBottom.y} ${rectLeftTop.x},${rectRightBottom.y} ${rectLeftTop.x},${rectLeftTop.y}`}
        fill="#fff2ea"
      />
      <rect
        x={`${rectLeftTop.x}`}
        y={`${rectLeftTop.y}`}
        width={`${width}`}
        height={`${height}`}
        fill="none" stroke="#fce8d4" strokeWidth="2"
      />
      <line
        x1={`${vLine1.x1}`}
        x2={`${vLine1.x2}`}
        y1={`${vLine1.y1}`}
        y2={`${vLine1.y2}`}
        stroke="#fce8d4" strokeWidth="2"
      />
      <line
        x1={`${vLine2.x1}`}
        x2={`${vLine2.x2}`}
        y1={`${vLine2.y1}`}
        y2={`${vLine2.y2}`}
        stroke="#fce8d4" strokeWidth="2"
      />
      <line
        x1={`${start.x}`}
        x2={`${current.x}`}
        y1={`${start.y}`}
        y2={`${current.y}`}
        stroke="#ff9b6a" strokeWidth="2"
      />
      <line
        x1={`${current.x}`}
        x2={`${end.x}`}
        y1={`${current.y}`}
        y2={`${end.y}`}
        stroke="#fce8d4" strokeWidth="2"
      />
      <circle
        cx={`${end.x}`}
        cy={`${end.y}`}
        r="5" fill="#fce8d4"
      />
      <circle
        cx={`${current.x}`}
        cy={`${current.y}`}
        r="5" fill="#ff9b6a"
      />
      <circle
        cx={`${start.x}`}
        cy={`${start.y}`}
        r="5" fill="#ff9b6a"
      />
    </svg>
  );
};

class PlanetInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.forms = {
      nameModal: null,
      introModal: null,
      saleModal: null
    };
    this.state = {
      isOperationComplete: true,
      nameModal: {
        visible: false,
        confirmLoading: false
      },
      introModal: {
        visible: false,
        confirmLoading: false
      },
      saleModal: {
        visible: false,
        confirmLoading: false
      }
    }
  }

  componentDidMount() {
    const { location, dispatch } = this.props;
    let planetNo = null;
    if (location.search) {
      const params = queryString.parse(location.search.substr(1));
      if (params && params.planetNo) {
        planetNo = params.planetNo;
        dispatch({
          type: 'planet/fetchOne',
          payload: {
            planetNo,
          }
        });
      }
    }
  }

  saveFormRef = (key, form) => {
    this.forms[key] = form;
  };

  showModal = (key) => {
    this.setState({
      ...this.state,
      [key]: {
        visible: true
      }
    });
  };

  handleCancel = (key) => {
    this.setState({
      ...this.state,
      [key]: {
        visible: false
      }
    });
  };

  handleCustomInfo = (key, values) => {
    const { dispatch, planet } = this.props;
    let k = '_';
    let v = null;
    let prevV = null;
    if (key === 'nameModal') {
      k = 'customName';
      v = values.customName.trim();
      prevV = planet.customName;
    } else if (key === 'introModal') {
      k = 'customIntro';
      v = values.customIntro.trim();
      prevV = planet.customIntro;
    }

    if (!v || prevV === v) {
      return Promise.resolve();
    }

    return dispatch({
      type: 'planet/customPlanetInfo',
      payload: {
        planetId: planet.id,
        [k]: v
      }
    });
  };

  handleSale = (key, values) => {
    const { dispatch, planet, user } = this.props;

    return dispatch({
      type: 'planet/sale',
      payload: {
        planetId: planet.id,
        planetNo: planet.planetNo,
        sender: user.account,
        startPrice: toWei(Number(values.startPrice)),
        endPrice: toWei(Number(values.endPrice)),
        duration: Number(values.duration) * 86400
      }
    });
  };

  handleOk = (key) => {
    const form = this.forms[key];
    form.validateFields((err, values) => {
      if (!err) {
        let pro = Promise.resolve();
        const extraStateBefore = {};
        if (key === 'saleModal') {
          extraStateBefore.isOperationComplete = false;
          pro = this.handleSale(key, values);
        } else {
          pro = this.handleCustomInfo(key, values);
        }

        this.setState({
          ...this.state,
          ...extraStateBefore,
          [key]: {
            confirmLoading: true
          }
        });

        let description = '';
        const extraStateAfter = {};
        if (key === 'saleModal') {
          description = '星星拍卖创建成功！';
          extraStateAfter.isOperationComplete = true;
        } else {
          description = '星星信息修改成功！'
        }

        pro.then(() => {
          notification.info({
            message: '成功！',
            description
          });

          this.setState({
            ...this.state,
            ...extraStateAfter,
            [key]: {
              visible: false,
              confirmLoading: false
            }
          });
        })
          .catch((e) => {
            if (!e.message) {
              e.message = '出错啦！';
            }
            notification.error(e);

            this.setState({
              ...this.state,
              ...extraStateAfter,
              [key]: {
                visible: false,
                confirmLoading: false
              }
            });
          });
      }
    });
  };

  handleCancelAuction = () => {
    const { planet, dispatch, user } = this.props;
    this.setState({
      ...this.state,
      isOperationComplete: false
    });
    dispatch({
      type: 'planet/cancelAuction',
      payload: {
        sender: user.account,
        auctionId: planet.auction.id,
        planetNo: planet.planetNo
      }
    })
      .then(() => {
        this.setState({
          ...this.state,
          isOperationComplete: true
        });
        notification.info({
          message: '成功！',
          description: '星星拍卖取消成功！'
        });
      });
  };

  handleBuy = () => {
    const { planet, dispatch, user } = this.props;
    const price = getCurrentPriceIntStr(planet.auction);
    if (!price) {
      return;
    }

    this.setState({
      ...this.state,
      isOperationComplete: false
    });

    dispatch({
      type: 'planet/buy',
      payload: {
        sender: user.account,
        auctionId: planet.auction.id,
        planetNo: planet.planetNo,
        price
      }
    })
      .then(() => {
        this.setState({
          ...this.state,
          isOperationComplete: true
        });
        notification.info({
          message: '成功！',
          description: '星星购买成功！'
        });
      });
  };

  render() {
    const { planet, user } = this.props;
    if (!planet) {
      return (<div style={{background: '#fff', padding: 24, minHeight: 380}} />);
    }

    const { isOperationComplete } = this.state;

    let chineseNameComp = null;
    if (planet.chineseName) {
      chineseNameComp = (<div><strong>中文原名：</strong>{planet.chineseName}</div>);
    }
    let englishNameComp = null;
    if (planet.englishName) {
      englishNameComp = (<div><strong>英文原名：</strong>{planet.englishName}</div>);
    }

    let auctionComp = null;
    const auction = planet.auction;
    if (auction) {
      let operationComp = (
        <Link to="/info">
          <Button type="primary" size="large">登录购买</Button>
        </Link>
      );
      if (user && user.accountStatus === ACCOUNT_STATUS.HAS_LOGIN) {
        if (user.account === planet.owner.walletAddr) {
          if (isOperationComplete) {
            operationComp = (
              <Button type="danger" size="large" onClick={this.handleCancelAuction}>
                取消拍卖
              </Button>
            );
          } else {
            operationComp = <Spin size="large" tip="拍卖取消中..."/>;
          }
        } else {
          if (isOperationComplete) {
            operationComp = (
              <Button type="danger" size="large" onClick={this.handleBuy}>
                购买星星
              </Button>
            );
          } else {
            operationComp = <Spin size="large" tip="购买中..."/>;
          }
        }
      }

      const timeLeft = getTimeLeft(auction);

      auctionComp = (
        <div className={styles.auctionContainer}>
          <Row>
            <strong style={{ fontSize: '1.5rem' }}>拍卖详情：</strong>
          </Row>
          <Row gutter={32} style={{ marginTop: '10px' }}>
            <Col span={6} style={{ fontSize: '1.2rem' }}>
              <strong>当前价格：</strong>
              <img src={ethIcon} alt="" style={{ height: '24px' }} />
              {getCurrentPrice(planet.auction)} ETH
            </Col>
            {
              timeLeft ?
                <Col span={6} style={{ fontSize: '1.2rem' }}>
                  <strong>剩余时间：</strong>
                  {timeLeft}
                </Col>
                : null
            }
            <Col span={6} align="right">
              {operationComp}
            </Col>
          </Row>
          <Row>
            {getRect(auction)}
          </Row>
          <Row>
            <div style={{ float: 'left', fontSize: '1.2rem' }}>
              <strong>起步价：</strong>
              <img src={ethIcon} alt="" style={{ height: '24px' }} />
              {getPriceStr(auction.startPrice)} ETH
            </div>
            <div style={{ float: 'right', fontSize: '1.2rem' }}>
              <strong>截止价：</strong>
              <img src={ethIcon} alt="" style={{ height: '24px' }} />
              {getPriceStr(auction.endPrice)} ETH
            </div>
          </Row>
        </div>
      );
    } else if (user && user.accountStatus === ACCOUNT_STATUS.HAS_LOGIN && user.account === planet.owner.walletAddr) {
      auctionComp = (
        <div className={styles.auctionContainer}>
          <Row gutter={32}>
            <Col span={6} style={{ fontSize: '1.5rem' }}>
              <strong>拍卖详情：</strong>无
            </Col>
            <Col span={6} offset={12} align="center">
              {
                isOperationComplete ? (
                  <Button type="primary" size="large" onClick={() => {this.showModal('saleModal')}}>
                    拍卖该星星
                  </Button>
                ) : <Spin size="large" tip="拍卖创建中..."/>
              }
            </Col>
          </Row>
        </div>
      );
    }

    const { nameModal, introModal, saleModal } = this.state;
    const basicInfoComp = (
      <div className={styles.infoContainer}>
        <div className={styles.headerContainer}>
          <Row gutter={32}>
            <Col span={16}>
              <div>
                  <h1 style={{ fontSize: '3rem' }} >星星#{planet.planetNo}</h1>
                  <h2 style={{ color: 'grey', fontSize: '2rem' }}>
                    <label style={{ verticalAlign: 'middle' }}>{planet.customName || '自定义命名'}</label>
                    &nbsp;
                    {
                      isMine(planet, user) ?
                        <Tooltip placement="right" title="星星所有者可以给星星命名">
                          <Button size="small" type="default" icon="edit" style={{ verticalAlign: 'middle' }}
                                  onClick={() => this.showModal('nameModal')}
                          />
                        </Tooltip>
                        : null
                    }
                  </h2>
                <div style={{ fontSize: '1.5rem' }}>
                  <div>
                    <strong>坐标：</strong>{planet.location}&nbsp;
                    <Tooltip placement="right" title="可以使用Google Earth根据坐标查看该星星">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </div>
                  {chineseNameComp}
                  {englishNameComp}
                  <div>
                    <strong>所有者：</strong>
                    <Link to={`/profile?walletAddr=${planet.owner.walletAddr}`}>
                      <Avatar size="small" src={planet.owner.headImg} />
                      &nbsp;{planet.owner.nickName}
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div align="right">
                <img src={planet.img} alt="" style={{ width: '300px' }} />
              </div>
            </Col>
          </Row>
        </div>
        <div>
          {auctionComp}
        </div>
        <div>
          <div style={{ fontSize: '1.5rem' }}>
            <strong>星星简介：</strong>
            <br />
            <pre style={{ fontSize: '1rem' }}>{planet.officialIntro}</pre>
          </div>
          <div style={{ fontSize: '1.5rem' }}>
            <strong style={{ verticalAlign: 'middle' }}>自定义简介：</strong>
            &nbsp;
            {
              isMine(planet, user) ?
                <Tooltip placement="right" title="星星所有者可以给星星添加介绍">
                  <Button size="small" type="default" icon="edit" style={{ verticalAlign: 'middle' }}
                          onClick={() => this.showModal('introModal')}
                  />
                </Tooltip>
                : null
            }
            <br />
            <pre style={{ fontSize: '1rem' }}>{planet.customIntro || '赶快添加自己对星星的介绍吧'}</pre>
          </div>
        </div>
        <ModalForm
          getRef={(form) => this.saveFormRef('nameModal', form)}
          title="自定义命名"
          visible={nameModal.visible}
          onOk={() => {this.handleOk('nameModal')}}
          confirmLoading={nameModal.confirmLoading}
          onCancel={() => this.handleCancel('nameModal')}
          FormComp={PlanetNameForm}
          initialValue={{ customName: planet.customName || "" }}
        />
        <ModalForm
          getRef={(form) => this.saveFormRef('introModal', form)}
          title="自定义简介"
          width={600}
          visible={introModal.visible}
          onOk={() => this.handleOk('introModal')}
          confirmLoading={introModal.confirmLoading}
          onCancel={() => this.handleCancel('introModal')}
          FormComp={PlanetIntroForm}
          initialValue={{ customIntro: planet.customIntro || "" }}
        />
        <ModalForm
          getRef={(form) => this.saveFormRef('saleModal', form)}
          title="创建拍卖"
          visible={saleModal.visible}
          onOk={() => this.handleOk('saleModal')}
          confirmLoading={saleModal.confirmLoading}
          onCancel={() => this.handleCancel('saleModal')}
          FormComp={SaleModalFrom}
        />
      </div>
    );

    return (
      <div style={{background: '#fff', padding: 24, minHeight: 380}}>
        {basicInfoComp}
      </div>
    );
  }
}

export default connect(state => {
  return {
    user: state.user,
    planet: state.planet.planet
  };
})(PlanetInfo);
