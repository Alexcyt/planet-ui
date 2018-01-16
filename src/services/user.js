import Web3 from 'web3';
import Promise from 'bluebird';

const web3 = window.web3;
let timerId = null;
let lastAccount = null;

export function listen(action) {
  window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
      const web3js = new Web3(web3.currentProvider);
      window.web3Instance = web3js;
      action({ type: 'has-metamask' });
      timerId = setInterval(() => {
        const currentAccount = web3.eth.accounts[0] || null;
        if (lastAccount !== currentAccount) {
          console.log('account change');
          lastAccount = currentAccount;
          action({ type: 'update-account', currentAccount });
        }
      }, 1000);
    }
  });
}

export function *getNetworkId() {
  if (typeof web3 !== 'undefined') {
    const getNetwork = Promise.promisify(web3.version.getNetwork);
    const netId = yield getNetwork();
    return netId;
  }
  return null;
}
