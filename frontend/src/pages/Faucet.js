import React, { useState } from 'react';
import { Pane, Button, Card, toaster, Heading, TextInput } from 'evergreen-ui';
import CopyableText from '../components/CopyableText';

import { useSubstrate } from '../substrate-lib';
import { getFromAcct } from '../utils/tx';

export default function ProcessPayment(props) {
  const { accountPair } = props;

  const { api } = useSubstrate();

  const [isRequesting, setIsRequesting] = useState(false);

  const requestFaucet = async () => {
    setIsRequesting(true);
    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2pPayment
        .faucet()
        .signAndSend(fromAcct, ({ status }) => {
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsRequesting(false);
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
          setIsRequesting(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
      setIsRequesting(false);
    }
  };

  return (
    <Pane
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {accountPair && (
        <Card elevation={1} marginTop={64} padding={32}>
          <Pane display="flex" marginTop="24px" alignItems="center">
            <Pane flex="1 0 0" marginRight={16}>
              <Heading size={400}>Address: </Heading>
            </Pane>
            <Pane flex="3 0 0">
              <CopyableText content={accountPair.address} />
            </Pane>
          </Pane>
          <Pane display="flex" marginTop="24px" alignItems="center">
            <Pane flex="1 0 0" marginRight={16}>
              <Heading size={400}>Amount: </Heading>
            </Pane>
            <Pane flex="3 0 0">
              <TextInput value="200 000 Libra" readOnly disabled></TextInput>
            </Pane>
          </Pane>
          <Pane
            display="flex"
            marginTop="24px"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Button
              onClick={requestFaucet}
              isLoading={isRequesting}
              appearance="primary"
            >
              Request faucet
            </Button>
          </Pane>
        </Card>
      )}
    </Pane>
  );
}
