import React, { useState } from 'react';
import {
  Pane,
  Button,
  toaster,
  Text,
} from 'evergreen-ui';

import { getFromAcct } from '../utils/tx';

import { useSubstrate } from '../substrate-lib';

export default function CancelPaymentConfirmation(props) {
  const { accountPair, payment, onClosed } = props;

  const [isCancelling, setIsCancelling] = useState(false);

  const { api } = useSubstrate();

  const discardForm = () => {
    onClosed && onClosed();
  };

  const cancelPayment = async () => {
    setIsCancelling(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2pPayment
        .cancelPayment(payment.id)
        .signAndSend(fromAcct, ({ status }) => {
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsCancelling(false);
            onClosed && onClosed();
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
          setIsCancelling(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
    }
  };

  return (
    <Pane>
      <Pane>
        <Text marginTop={32}>Once you confirm cancel this payment, the fund will be unlock for the payer and there is no chance to dispute if there any problem</Text>
      </Pane>
      <Pane marginY={24} display="flex" justifyContent="flex-end">
        <Button
          disabled={isCancelling}
          onClick={() => {
            discardForm();
          }}
        >
          Discard
        </Button>
        <Button
          appearance="primary"
          marginLeft={8}
          isLoading={isCancelling}
          disabled={isCancelling}
          onClick={() => cancelPayment()}
        >
          Confirm
        </Button>
      </Pane>
    </Pane>
  );
}
