import { formatBalance } from '@polkadot/util';

const Payment = (id, data) => ({
  id,
  name: data.name.toHuman(),
  amount: formatBalance(data.amount, { withSi: false, forceUnit: '-' }, 12),
  description: data.description.toHuman(),
  payer: data.payer.toJSON(),
  payee: data.payee.toJSON(),
  updatedAt: data.createdAtHash.toHuman(),
  status: data.status.toHuman(),
});

export default Payment;
