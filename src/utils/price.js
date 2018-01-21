const { web3 } = window;

export default function getCurrentPrice(auction) {
  const startAt = (new Date(auction.createTime)).getTime();
  const duration = auction.duration;
  const startPrice = Number.parseFloat(auction.startPrice);
  const endPrice = Number.parseFloat(auction.endPrice);
  let secondsPassed = 0;
  if (secondsPassed > startAt) {
    secondsPassed = ((new Date()).getTime() - startAt) / 1000;
  }

  if (secondsPassed > duration) {
    return web3.fromWei(auction.endPrice, 'ether');
  }

  let price = (endPrice - startAt) / duration * secondsPassed + startPrice;
  price = Math.ceil(price);
  return web3.fromWei(price, 'ether');
}
