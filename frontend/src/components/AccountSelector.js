import React, { useState, useEffect } from 'react';
import {
  Pane,
  Popover,
  Menu,
  Avatar,
  Position,
  CaretDownIcon,
  Text,
  Heading,
} from 'evergreen-ui';

import { useSubstrate } from '../substrate-lib';

export default function AccountSelector(props) {
  const { keyring } = useSubstrate();
  const [selectedAccount, setSelectedAccount] = useState({});
  const { onAccountSelected } = props;


  const keyringOptions = keyring.getPairs().map(account => ({
    address: account.address,
    name: account.meta.name.toUpperCase(),
  }));

  useEffect(() => {
    if (!selectedAccount.key && keyringOptions[0]) {
      selectAccount(keyringOptions[0]);
    }
  }, []);

  const selectAccount = (account, close) => {
    setSelectedAccount(account);
    onAccountSelected && onAccountSelected(account);
    close && close();
  };

  const shortedAddress = (startChars = 6, endChars = 4) => {
    if (selectedAccount && selectedAccount.address) {
      return `${selectedAccount.address.slice(
        0,
        startChars
      )}...${selectedAccount.address.slice(-endChars)}`;
    }

    return '';
  };

  return (
    <Pane>
      <Popover
        position={Position.BOTTOM_LEFT}
        content={({ close }) => (
          <Menu>
            {keyringOptions.map(account => (
              <Menu.Item
                key={account.address}
                onClick={() => selectAccount(account, close)}
              >
                {account.name}
              </Menu.Item>
            ))}
          </Menu>
        )}
      >
        <Pane display="flex" alignItems="center">
          <Avatar name={(selectedAccount.name || '').split('(')[0]} size={40}></Avatar>
          <Pane display="flex" justifyContent="center" flexDirection="column" alignItems="flex-start" marginLeft="16px">
            <Heading size={300}>{(selectedAccount.name || '').replace(' (POLKADOT-JS)', '')}</Heading>
            <Text size={300}>{shortedAddress(6, 6)}</Text>
          </Pane>
          <CaretDownIcon marginLeft="8px"></CaretDownIcon>
        </Pane>
      </Popover>
    </Pane>
  );
}
