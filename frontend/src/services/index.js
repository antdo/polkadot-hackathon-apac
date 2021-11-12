import PropTypes from 'prop-types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import queryString from 'query-string';

import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';

import config from '../config';

import Payment from './models/Payment';

import transformParams from './transformParams';

let api = null;

async function connect() {
  const socket = config.PROVIDER_SOCKET;
  const jsonrpc = { ...jsonrpc, ...config.RPC };
  const types = config.types;

  const provider = new WsProvider(socket);

  api = new ApiPromise({ provider, types, rpc: jsonrpc });

  return new Promise((resolve, reject) => {
    api.on('connected', () => {
      api.isReady.then(() => {
        resolve(api);
      });
    });

    api.on('ready', () => {
      resolve(api);
    });

    api.on('error', err => {
      reject(err);
    });
  });
}

async function getApi() {
  if (!api) {
    return connect();
  }

  return api;
}

async function getPayments(address) {
  const api = await getApi();
  const paymentIds = (
    await api.query.p2PPayment.paymentsOwned(address)
  ).toJSON();
  const payments = await api.query.p2PPayment.payments.multi(paymentIds);

  return payments.map((item, index) => Payment(paymentIds[index], item));
}

const getFromAcct = async accountPair => {
  const {
    address,
    meta: { source, isInjected },
  } = accountPair;
  let fromAcct;

  // signer is from Polkadot-js browser extension
  if (isInjected) {
    const injected = await web3FromSource(source);
    fromAcct = address;
    api.setSigner(injected.signer);
  } else {
    fromAcct = accountPair;
  }

  return fromAcct;
};

async function createPayment({ name, amout, description }) {
  const api = await getApi();
  const response = await api.tx.p2PPayment.createPayment({}).signAndSend();

  return response;
}

export default {
  connect,
  getPayments,
};
