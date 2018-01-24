import planetCoreSource from '../../build/contracts/PlanetCore.json';
import saleAuctionSource from '../../build/contracts/SaleClockAuction.json';
import config from '../../config/default.json';
import Promise from 'bluebird';

let planetContract = null;
let saleAuctionContract = null;
let planetContractInstance = null;
let saleAuctionContractInstance = null;

const gasLimit = 6e6;

export function getPlanetContractInstance() {
  const { web3Instance } = window;
  if (!web3Instance) {
    return null;
  }

  if (!planetContract) {
    planetContract = web3Instance.eth.contract(planetCoreSource.abi);
    planetContractInstance = planetContract.at(config.contract.planetCoreAddr);
  }
  return planetContractInstance;
}

export function getSaleAuctionContractInstance() {
  const { web3Instance } = window;
  if (!web3Instance) {
    return null;
  }

  if (!saleAuctionContract) {
    saleAuctionContract = web3Instance.eth.contract(saleAuctionSource.abi);
    saleAuctionContractInstance = saleAuctionContract.at(config.contract.saleClockAuctionAddr);
  }
  return saleAuctionContractInstance;
}

export function cancelAuction({ planetNo }) {
  const { web3Instance } = window;
  const saleInstance = getSaleAuctionContractInstance();
  if (!saleInstance) {
    return Promise.reject('以太坊网络连接出错！');
  }

  planetNo = Number.parseInt(planetNo, 10);
  const account = web3Instance.eth.accounts[0];
  saleInstance.AuctionCancelled().watch((err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
  return new Promise((resolve, reject) => {
    saleInstance.cancelAuction(planetNo, {
      gas: gasLimit,
      from: account,
      to: config.contract.saleClockAuctionAddr
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
