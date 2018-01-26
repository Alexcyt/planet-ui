import Web3 from 'web3';

const BN = Web3.utils.BN;

export function getPriceStr(_price) {
  let price = new BN(_price);
  price = Web3.utils.fromWei(price, 'ether');
  const pos = price.indexOf('.');
  if (pos !== -1) {
    price = price.substr(0, pos + 7);
  }
  return price;
}

export function getCurrentPrice(auction) {
  const startAt = (new Date(auction.createTime)).getTime();
  const duration = auction.duration;
  const now = (new Date()).getTime();
  let secondsPassed = 0;
  if (now > startAt) {
    secondsPassed = (now - startAt) / 1000;
  }

  if (secondsPassed >= duration) {
    return getPriceStr(auction.endPrice);
  }

  const startPrice = new BN(auction.startPrice);
  const endPrice = new BN(auction.endPrice);
  const price = endPrice.sub(startPrice).div(new BN(duration)).mul(new BN(secondsPassed)).add(startPrice).toString(10);
  return getPriceStr(price);
}

export function getCurrentPriceIntStr(auction) {
  const startAt = (new Date(auction.createTime)).getTime();
  const duration = auction.duration;
  const now = (new Date()).getTime();
  let secondsPassed = 0;
  if (now > startAt) {
    secondsPassed = (now - startAt) / 1000;
  }

  if (secondsPassed >= duration) {
    return auction.endPrice;
  }

  const startPrice = new BN(auction.startPrice);
  const endPrice = new BN(auction.endPrice);
  const price = endPrice.sub(startPrice).div(new BN(duration)).mul(new BN(secondsPassed)).add(startPrice)
    .mul(new BN(11)).div(new BN(10)).toString(10);
  return price;
}

export function toWei(price, unit = 'ether') {
  return Web3.utils.toWei(`${price}`, unit);
}
