import planetCoreSource from '../../build/contracts/PlanetCore.json';
import saleAuctionSource from '../../build/contracts/SaleClockAuction.json';
import config from '../../config/default.json';
// import Promise from 'bluebird';

let planetContractInstance = null;
let saleAuctionContractInstance = null;
const gasLimit = 6e6;

function getPlanetContractInstance() {
  const { web3Instance } = window;
  if (!web3Instance) {
    return null;
  }

  if (!planetContractInstance) {
    planetContractInstance = new web3Instance.eth.Contract(planetCoreSource.abi, config.contract.planetCoreAddr);
  }
  return planetContractInstance;
}

function getSaleAuctionContractInstance() {
  const { web3Instance } = window;
  if (!web3Instance) {
    return null;
  }

  if (!saleAuctionContractInstance) {
    saleAuctionContractInstance = new web3Instance.eth.Contract(saleAuctionSource.abi, config.contract.saleClockAuctionAddr);
  }
  return saleAuctionContractInstance;
}

export async function cancelAuction({ planetNo, sender }) {
  const saleInstance = getSaleAuctionContractInstance();
  if (!saleInstance) {
    throw new Error('以太坊网络连接出错！');
  }

  planetNo = Number.parseInt(planetNo, 10);
  const resp = await saleInstance.methods.cancelAuction(planetNo).send({
    from: sender,
    gas: gasLimit
  });
  const respEvents = resp.events;
  if (!respEvents || !respEvents.AuctionCancelled) {
    const error = new Error('cancel auction on ethereum error');
    error.resp = resp;
    throw error;
  }
}

export async function buy({ planetNo, price, sender }) {
  const saleInstance = getSaleAuctionContractInstance();
  if (!saleInstance) {
    throw new Error('以太坊网络连接出错！');
  }

  planetNo = Number.parseInt(planetNo, 10);
  const resp = await saleInstance.methods.bid(planetNo).send({
    from: sender,
    value: price,
    gas: gasLimit
  });
  const respEvents = resp.events;
  if (!respEvents || !respEvents.AuctionSuccessful) {
    const error = new Error('buy planet on ethereum error');
    error.resp = resp;
    throw error;
  }
}

export async function sale({ planetNo, sender, startPrice, endPrice, duration }) {
  const planetInstance = getPlanetContractInstance();
  if (!planetInstance) {
    throw new Error('以太坊网络连接出错！');
  }

  planetNo = Number.parseInt(planetNo, 10);
  const resp = await planetInstance.methods.createSaleAuction(
    planetNo,
    startPrice,
    endPrice,
    duration
  ).send({
    from: sender,
    gas: gasLimit
  });
  const respEvents = resp.events;
  if (!respEvents || !respEvents.Transfer) {
    const error = new Error('create planet sale auction on ethereum error');
    error.resp = resp;
    throw error;
  }
}
