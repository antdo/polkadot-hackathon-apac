import React, { useEffect, useState } from 'react';
import { useSubstrate } from '../substrate-lib';

import { Pane, Card, Heading, Text } from 'evergreen-ui';

import { formatBalance } from '@polkadot/util';

export default function Balance(props) {
  const { accountPair } = props;
  const { api } = useSubstrate();
  const [balance, setBalance] = useState({});

  useEffect(() => {
    let unsubscribeAll = null;

    if (accountPair) {
      api.query.system
        .account(accountPair.address, balance => {
          const total = formatBalance(
            balance.data.free,
            { withSi: false, forceUnit: '-' },
            12
          );
          const locked = formatBalance(
            balance.data.miscFrozen,
            { withSi: false, forceUnit: '-' },
            12
          );
          const available = formatBalance(
            balance.data.free.sub(balance.data.miscFrozen),
            { withSi: false, forceUnit: '-' },
            12
          );
          setBalance({
            total,
            available,
            locked,
          });
        })
        .then(unsub => {
          unsubscribeAll = unsub;
        })
        .catch(console.error);
    }

    return () => unsubscribeAll && unsubscribeAll();
  }, [accountPair, api, setBalance]);

  return (
    <Card border="solid 1px #c1c4d6" padding={16}>
      <Pane display="flex" justifyContent="space-between">
        <Pane>
          <Heading size={300}>Total</Heading>
        </Pane>
        <Pane>
          <Text size={300}>{balance.total} Libra</Text>
        </Pane>
      </Pane>

      <Pane display="flex" justifyContent="space-between" alignItems='center'>
        <Pane>
          <Heading size={300}>Available</Heading>
        </Pane>
        <Pane>
          <Text size={300}>{balance.available} Libra</Text>
        </Pane>
      </Pane>

      <Pane display="flex" justifyContent="space-between" alignItems='center'>
        <Pane>
          <Heading size={300}>Locked</Heading>
        </Pane>
        <Pane>
          <Text size={300}>{balance.locked} Libra</Text>
        </Pane>
      </Pane>
    </Card>
  );
}
