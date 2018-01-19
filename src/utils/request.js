import fetch from 'dva/fetch';
// import RETCODE from '../../constants/ret-code';

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error();
  error.message = '网络出错';
  error.description = response.statusText;
  throw error;
}

export function request(url, options) {
  return fetch(url, { mode: 'cors', credentials: 'include', ...options })
    .then(checkStatus)
    .then(parseJSON)
}

export function errorProcess({ msg }) {
  const error = new Error();
  error.message = '服务器出错';
  error.description = msg;
  return error;
}
