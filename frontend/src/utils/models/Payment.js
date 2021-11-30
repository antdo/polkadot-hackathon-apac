import { formatBalance } from '@polkadot/util';

const Payment = (id, data) => ({
  id,
  name: Buffer.from(data.name.toHuman(), 'base64').toString('utf-8'),
  amount: formatBalance(data.amount, { withSi: false, forceUnit: '-' }, 12),
  description: Buffer.from(data.description.toHuman(), 'base64').toString(
    'utf-8'
  ),
  images: data.images.toHuman().map(image => ({
    proof: image.proof,
    url: Buffer.from(image.url, 'base64').toString('utf-8'),
  })),
  payer: data.payer.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' ? data.payer.toString() : '',
  payee: data.payee.toJSON(),
  updatedAt: data.createdAtHash.toHuman(),
  status: data.status.toHuman(),
});

export default Payment;
