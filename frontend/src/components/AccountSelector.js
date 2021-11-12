import React, { useState, useEffect } from 'react';
import {
  Pane,
  Popover,
  Menu,
  Avatar,
  Position,
  CaretDownIcon,
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

  const selectAccount = account => {
    setSelectedAccount(account);
    onAccountSelected && onAccountSelected(account);
  };

  return (
    <Pane>
      <Popover
        position={Position.BOTTOM_LEFT}
        content={
          <Menu>
            {keyringOptions.map(account => (
              <Menu.Item key={account.address} onClick={() => selectAccount(account)}>
                {account.name}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Pane display="flex" alignItems="center">
          <Avatar name={selectedAccount.name} size={40}></Avatar>
          <CaretDownIcon></CaretDownIcon>
        </Pane>
      </Popover>
    </Pane>
  );
}
