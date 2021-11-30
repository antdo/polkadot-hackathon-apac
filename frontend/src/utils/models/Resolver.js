import { formatBalance } from '@polkadot/util';

const Resolver = (data) => ({
  account: data.account.toJSON(),
  name: Buffer.from(data.name.toHuman(), 'base64').toString('utf-8'),
  application: Buffer.from(data.application.toHuman(), 'base64').toString(
    'utf-8'
  ),
  staked: formatBalance(data.staked, { withSi: false, forceUnit: '-' }, 12),
  delegators: data.delegators.toJSON().map(delegator => ({
    account: delegator.account,
    amount: formatBalance(delegator.amount, { withSi: false, forceUnit: '-' }, 12)
  })),
  status: data.status.toHuman(),
});

export default Resolver;
