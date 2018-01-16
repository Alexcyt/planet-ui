import * as userServise from '../services/user';

export default {
  namespace: 'user',
  state: {
    web3: null,
    netId: null,
    account: null
  },

  reducers: {
    init(state) {
      return {
        ...state,
        web3: { hasMetaMask: true }
      };
    },

    updateAccount(state, { currentAccount }) {
      return { ...state, account: currentAccount };
    },

    updateNet(state, { netId }) {
      return { ...state, netId };
    }
  },

  effects: {
    *getNetId(action, { call, put }) {
      const netId = yield call(userServise.getNetworkId);
      yield put({ type: 'updateNet', netId });
    }
  },

  subscriptions: {
    setup({ dispatch }) {
      return userServise.listen(data => {
        switch (data.type) {
          case 'has-metamask':
            dispatch({ type: 'init' });
            break;
          case 'update-account':
            dispatch({ type: 'updateAccount', currentAccount: data.currentAccount });
            break;
          default:
            console.log('error');
        }
      });
    },
  }
};
