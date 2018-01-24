import planetCoreSource from '../../build/contracts/PlanetCore.json';
import saleAuctionSource from '../../build/contracts/SaleClockAuction.json';
import config from '../../config/default.json';
import Promise from 'bluebird';

// let planetContract = null;
// let saleAuctionContract = null;
let planetContractInstance = null;
let saleAuctionContractInstance = null;

const gasLimit = 6e6;

export function getPlanetContractInstance() {
  const { web3Instance } = window;
  if (!web3Instance) {
    return null;
  }

  if (!planetContractInstance) {
    planetContractInstance = new web3Instance.eth.Contract(planetCoreSource.abi, config.contract.planetCoreAddr);
  }
  return planetContractInstance;
}

export function getSaleAuctionContractInstance() {
  const { web3Instance } = window;
  if (!web3Instance) {
    return null;
  }

  if (!saleAuctionContractInstance) {
    saleAuctionContractInstance = new web3Instance.eth.Contract(saleAuctionSource.abi, config.contract.saleClockAuctionAddr);
  }
  return saleAuctionContractInstance;
}

export async function cancelAuction({ planetNo }) {
  const { web3Instance } = window;
  const saleInstance = getSaleAuctionContractInstance();
  if (!saleInstance) {
    return Promise.reject('以太坊网络连接出错！');
  }

  planetNo = Number.parseInt(planetNo, 10);
  const accounts = await web3Instance.eth.getAccounts();
  const account = accounts[0];
  const resp = await saleInstance.methods.cancelAuction(planetNo).send({
    from: account,
    gas: gasLimit
  });
  return resp;
}
