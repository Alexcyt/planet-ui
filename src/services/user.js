import Web3 from 'web3';
import Promise from 'bluebird';
import { request } from '../utils/request';
import config from '../../config/default.json';
import { ACCOUNT_STATUS } from '../../constants/common';

const { apiPrefix } = config;
const { web3 } = window;
let timetId = null;
let lastAccount = null;

export function listen(action) {
  window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
      const web3js = new Web3(web3.currentProvider);
      window.web3Instance = web3js;
      const getNetwork = Promise.promisify(web3.version.getNetwork);

      getNetwork()
        .then(netId => {
          const account = web3.eth.accounts[0] || null;
          lastAccount = account;
          if (netId !== config.ethereumNetId) {
            action({
              type: 'init-ok',
              payload: { accountStatus: ACCOUNT_STATUS.WRONG_NET }
            });
          } else if (!account) {
            action({
              type: 'init-ok',
              payload: {
                accountStatus: ACCOUNT_STATUS.LOCKED_ACCOUNT,
                netId
              }
            });
          } else {
            action({
              type: 'init-ok',
              payload: {
                accountStatus: ACCOUNT_STATUS.UN_REGISTER,
                account,
                netId
              }
            });
          }
        })

        .then(() => {
          timetId = setInterval(() => {
            const currentAccount = web3.eth.accounts[0] || null;
            if (currentAccount !== lastAccount) {
              lastAccount = currentAccount;
              action({
                type: 'change-account',
                payload: {
                  account: currentAccount,
                }
              });
            }
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
