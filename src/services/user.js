import Web3 from 'web3';
// import Promise from 'bluebird';
import { request } from '../utils/request';
import config from '../../config/default.json';
import { ACCOUNT_STATUS } from '../../constants/common';

const { apiPrefix } = config;
const { web3 } = window;
// let timetId = null;
let lastAccount = null;

export function listen(action) {
  window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
      const web3js = new Web3(web3.currentProvider);
      web3js.setProvider(web3.currentProvider);
      window.web3Instance = web3js;
      init(web3js, action)
        .then(() => {
          setInterval(() => {
            web3js.eth.getAccounts()
              .then(accounts => {
                let currentAccount = accounts[0] || null;
                if (currentAccount) {
                  currentAccount = currentAccount.toLowerCase();
                }
                if (currentAccount !== lastAccount) {
                  lastAccount = currentAccount;
                  action({
                    type: 'change-account',
                    payload: {
                      account: currentAccount,
                    }
                  });
                }
              });
          }, 200);
        })
        .catch(err => {
          console.log(err);
          action({ type: 'init-error' });
        });
    }
  });
}

export function login(account) {
  return request(`${apiPrefix}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      walletAddr: account
    })
  });
}

export function logout() {
  return request(`${apiPrefix}/users/logout`, { method: 'POST' });
}

export function register(payload) {
  return request(`${apiPrefix}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateUserInfo(payload) {
  return request(`${apiPrefix}/users`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function getUserInfo(walletAddr) {
  return request(`${apiPrefix}/users/${walletAddr}`);
}

async function init(web3, action) {
  const netId = await web3.eth.net.getId();
  if (netId !== config.ethereumNetId) {
    action({
      type: 'init-ok',
      payload: { accountStatus: ACCOUNT_STATUS.WRONG_NET }
    });
    return;
  }

  const accounts = await web3.eth.getAccounts();
  let account = accounts[0] || null;
  if (account) {
    account = account.toLowerCase();
  }
  lastAccount = account;
  if (!account) {
    action({
      type: 'init-ok',
      payload: {
        accountStatus: ACCOUNT_STATUS.LOCKED_ACCOUNT,
        netId
      }
    });
    return;
  }

  action({
    type: 'init-ok',
    payload: {
      accountStatus: ACCOUNT_STATUS.UN_REGISTER,
      account,
      netId
    }
  });
}
