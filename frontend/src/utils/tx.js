import { web3FromSource } from '@polkadot/extension-dapp';

export const getFromAcct = async accountPair => {
  const {
    address,
    meta: { source, isInjected },
  } = accountPair;

  if (isInjected) {
    const injected = await web3FromSource(source);

    return {
      fromAcct: address,
      signer: injected.signer,
    };
  }

  return {
    fromAcct: accountPair,
  };
};
