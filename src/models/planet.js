import * as planetService from '../services/planet';
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
    }
  }
};
