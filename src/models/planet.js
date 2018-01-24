import * as planetService from '../services/planet';
import * as ethService from '../services/ethnet';
import * as auctionService from '../services/auction';
import { errorProcess } from "../utils/request";
import RETCODE from '../../constants/ret-code';
// import config from '../../config/default.json';

export default {
  namespace: 'planet',
  state: {
    list: [],
    pagination: null,
    planet: null
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    }
  },

  effects: {
    *fetchList({ payload: { query } }, { call, put }) {
      const resp = yield call(planetService.getPlanets, query);
      if (resp.retCode === RETCODE.SUCCESS) {
        const { pagination, planets } = resp.data;
        yield put({ type: 'save', payload: { list: planets, pagination } });
        return;
      }

      throw errorProcess(resp);
    },

    *fetchOne({ payload: { planetNo } }, { call, put }) {
      const resp = yield call(planetService.getPlanet, planetNo);
      if (resp.retCode === RETCODE.SUCCESS) {
        yield put({ type: 'save', payload: { planet: resp.data } });
        return;
      }

      throw errorProcess(resp);
    },

    *customPlanetInfo({ payload }, { call, put, select }) {
      const resp = yield call(planetService.customPlanetInfo, payload);
      if (resp.retCode === RETCODE.SUCCESS) {
        const planet = yield select(state => state.planet.planet);
        yield put({
          type: 'save',
          payload: {
            planet: {
              ...planet,
              ...payload
            }
          }
        });
        return;
      }

      throw errorProcess(resp);
    },

    *cancelAuction({ payload }, { call, put, select }) {
      try {
        let resp = yield call(ethService.cancelAuction, payload);
        console.log(resp);
        resp = yield call(auctionService.cancelAuction, payload);
        if (resp.retCode === RETCODE.SUCCESS) {
          const planet = yield select(state => state.planet.planet);
          yield put({
            type: 'save',
            payload: {
              planet: {
                ...planet,
                auction: null
              }
            }
          });
          return;
        }

        throw errorProcess(resp);
      } catch (err) {
        console.log(err);
        const errObj = { message: '网络错误', description: '以太坊网络操作失败' };
        throw errObj;
      }
    }
  }
};
