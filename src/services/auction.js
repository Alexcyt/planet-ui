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
