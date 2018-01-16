import * as userServise from '../services/user';

export default {
  namespace: 'user',
  state: {
    hasMetaMask: false,
    netId: null,
    account: null
  },

  reducers: {
    save(state, { payload: { hasMetaMask, netId, account } }) {
      return {
        ...state,
        hasMetaMask,
        netId,
        account
      };
    },
    updateAccount(state, { payload: { currentAccount } }) {
      return {
        ...state,
        account: currentAccount
      };
    }
  },

  effects: {
  },

  subscriptions: {
    setup({ dispatch }) {
      return userServise.listen(({ type, payload }) => {
        switch (type) {
          case 'init-ok':
            dispatch({ type: 'save', payload });
            break;
          case 'change-account':
            dispatch({ type: 'updateAccount', payload });
            break;
          default:
            console.log('error');
        }
      });
    },
  }
};
