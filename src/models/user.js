import * as userServise from '../services/user';
import { errorProcess } from "../utils/request";
import RETCODE from '../../constants/ret-code';
import { ACCOUNT_STATUS } from '../../constants/common';
import config from '../../config/default.json';

export default {
  namespace: 'user',
  state: {
    accountStatus: ACCOUNT_STATUS.NO_METAMASK,
    netId: null,
    account: null,
    profile: null
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
  },

  effects: {
    *login({ payload }, { call, put } ) {
      const { account } = payload;
      const resp = yield call(userServise.login, account);
      if (resp.retCode === RETCODE.SUCCESS) {
        yield put({
          type: 'save',
          payload: {
            ...payload,
            accountStatus: ACCOUNT_STATUS.HAS_LOGIN,
            profile: resp.data
          }
        });
      } else if (resp.retCode === RETCODE.NOT_FOUND) {
        yield put({ type: 'save', payload: { ...payload, accountStatus: ACCOUNT_STATUS.UN_REGISTER } });
      } else {
        throw errorProcess(resp);
      }
    },

    *logout(action, { call } ) {
      const resp = yield call(userServise.logout);
      if (resp.retCode !== RETCODE.SUCCESS) {
        throw errorProcess(resp);
      }
    },

    *init({ payload }, { put } ) {
      const { accountStatus } = payload;
      if (accountStatus !== ACCOUNT_STATUS.UN_REGISTER) {
        yield put({ type: 'save', payload });
      } else {
        yield put({ type: 'login', payload });
      }
    },

    *change({ payload }, { put, select }) {
      const { account } = payload;
      const { netId, accountStatus, account: prevAccount } = yield select(state => state.user);

      if (netId !== config.ethereumNetId) {
        yield put({ type: 'save', payload });
        return;
      }

      if (prevAccount && !account) {
        if (accountStatus === ACCOUNT_STATUS.HAS_LOGIN) {
          yield put({ type: 'logout' });
        }
        yield put({
          type: 'save',
          payload: {
            account: null,
            accountStatus: ACCOUNT_STATUS.LOCKED_ACCOUNT,
            profile: null
          }
        });
        return;
      }

      if (!prevAccount && account) {
        yield put({ type: 'login', payload: { account } });
        return;
      }

      if (prevAccount && account && prevAccount !== account) {
        if (accountStatus === ACCOUNT_STATUS.HAS_LOGIN) {
          yield put({type: 'logout'});
        }
        yield put({ type: 'login', payload: { account } });
      }
    },

    *register({ payload }, { call, put }) {
      const resp = yield call(userServise.register, payload);
      if (resp.retCode === RETCODE.SUCCESS) {
        yield put({
          type: 'save',
          payload: {
            accountStatus: ACCOUNT_STATUS.HAS_LOGIN,
            profile: {
              nickName: payload.nickName,
              email: payload.email,
              headImg: resp.data.headImg
            }
          }
        });
        return
      }

      throw errorProcess(resp);
    },

    *updateProfile({ payload }, { call, put, select }) {
      const resp = yield call(userServise.updateUserInfo, payload);
      if (resp.retCode === RETCODE.SUCCESS) {
        const prevProfile = yield select(state => state.user.profile);
        yield put({
          type: 'save',
          payload: {
            profile: { ...prevProfile, ...payload }
          }
        });
        return;
      }

      throw errorProcess(resp);
    }
  },

  subscriptions: {
    setup({ dispatch }, done) {
      return userServise.listen(({ type, payload }) => {
        switch (type) {
          case 'init-ok':
            dispatch({ type: 'init', payload });
            break;
          case 'change-account':
            dispatch({ type: 'change', payload });
            break;
          default:
            done({ message: '初始化出错', description: '初始化Ethereum信息出错' });
        }
      });
    },
  }
};
