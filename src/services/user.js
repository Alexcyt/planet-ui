import Web3 from 'web3';
import Promise from 'bluebird';

const web3 = window.web3;
let timetId = null;
let lastAccount = null;

export function listen(action) {
  window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
      const web3js = new Web3(web3.currentProvider);
      window.web3Instance = web3js;
      const account = web3.eth.accounts[0] || null;
      lastAccount = account;
      const getNetwork = Promise.promisify(web3.version.getNetwork);
      getNetwork()
        .then(netId => {

          action({
            type: 'init-ok',
            payload: {
              hasMetaMask: true,
              account,
              netId
            }
          });
        })
        .catch(err => {
          console.log(err);
        });

      timetId = setInterval(() => {
        const currentAccount = web3.eth.accounts[0];
        if (currentAccount !== lastAccount) {
          lastAccount = currentAccount;
          action({
            type: 'change-account',
            payload: {
              account: currentAccount
            }
          });
        }
      }, 200);
    }
  });
}
