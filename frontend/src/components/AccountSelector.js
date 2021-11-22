import React, { useState, useEffect } from 'react';
import {
  Pane,
  Popover,
  Menu,
  Avatar,
  Position,
  CaretDownIcon,
  Text,
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
    if (!selectedAccount.key) {
      selectAccount(keyringOptions[0]);
    }
  }, []);

  const selectAccount = (account, close) => {
    setSelectedAccount(account);
    onAccountSelected && onAccountSelected(account);
    close && close();
  };

  const shortedAddress = () => {
    if (selectedAccount && selectedAccount.address) {
      return `${selectedAccount.address.slice(
        0,
        6
      )}...${selectedAccount.address.slice(-4)}`;
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
          <Pane display="flex" alignItems="center" marginLeft="16px">
            <Text>{shortedAddress()}</Text>
          </Pane>
          <CaretDownIcon marginLeft="8px"></CaretDownIcon>
        </Pane>
      </Popover>
    </Pane>
  );
}
