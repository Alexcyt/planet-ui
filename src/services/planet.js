import { request } from '../utils/request';
import config from '../../config/default.json';
import queryString from 'querystring';

const { apiPrefix } = config;

export function getPlanets(query) {
  return request(`${apiPrefix}/planets?${queryString.stringify(query)}`);
}

export function getPlanet(planetNo) {
  return request(`${apiPrefix}/planets/${planetNo}`);
}

export function customPlanetInfo(payload) {
  return request(`${apiPrefix}/planets`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}
