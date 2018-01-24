const { web3Instance } = window;

export default function getCurrentPrice(auction) {
  if (!web3Instance) {
    return '';
  }

  const startAt = (new Date(auction.createTime)).getTime();
  const duration = auction.duration;
  const startPrice = Number.parseFloat(auction.startPrice);
  const endPrice = Number.parseFloat(auction.endPrice);
  const now = (new Date()).getTime();
  let secondsPassed = 0;
  if (now > startAt) {
    secondsPassed = (now - startAt) / 1000;
  }

  if (secondsPassed >= duration) {
    return web3Instance.utils.fromWei(auction.endPrice, 'ether');
  }

  let price = (endPrice - startAt) / duration * secondsPassed + startPrice;
  price = Math.ceil(price / 1e10) * 1e10;
  return web3Instance.utils.fromWei(price, 'ether');
}
