import { request } from '../utils/request';
import config from '../../config/default.json';
// import queryString from 'querystring';

const { apiPrefix } = config;

export function cancelAuction({ auctionId }) {
  return request(`${apiPrefix}/auctions`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ auctionId })
  });
}

export function buy({ auctionId }) {
  return request(`${apiPrefix}/auctions/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ auctionId })
  });
}

export function sale({ planetId, startPrice, endPrice, duration }) {
  return request(`${apiPrefix}/auctions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      planetId,
      startPrice,
      endPrice,
      duration
    })
  });
}
