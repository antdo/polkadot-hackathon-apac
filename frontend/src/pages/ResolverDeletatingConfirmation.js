import React, { useState } from 'react';
import { Pane, Button, TextInputField, toaster } from 'evergreen-ui';

import { getFromAcct } from '../utils/tx';

import { useSubstrate } from '../substrate-lib';

export default function ResolverDeletatingConfirmation(props) {
  const { accountPair, resolver, onFormClosed } = props;

  const [amount, setAmount] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { api } = useSubstrate();

  const submitForm = async () => {
    setIsSubmitting(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2pPayment
        .stakeToResolver(
          resolver.account,
          `${Number.parseInt(amount * 10 ** 12)}`
        )
        .signAndSend(fromAcct, ({ status }) => {
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsSubmitting(false);
            onFormClosed();
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
          setIsSubmitting(false);
        });
    } catch (err) {
      console.log(err);
      toaster.danger(`😞 Failed: ${err.message}`);
    }
  };

  const discardForm = () => {
    if (onFormClosed) {
      onFormClosed();
    }
  };

  return (
    <Pane>
      {resolver && (
        <Pane>
          <TextInputField label="Name:" value={resolver.name} readOnly />

          <TextInputField label="Address:" value={resolver.account} readOnly />

          <TextInputField
            label="Amount:"
            placeholder="Staking amount"
            value={amount}
            onInput={e => {
              setAmount(e.target.value);
            }}
            required
          />

          <Pane display="flex" justifyContent="flex-end" paddingBottom={24}>
            <Button disabled={isSubmitting} onClick={discardForm}>
              Discard
            </Button>
            <Button
              isLoading={isSubmitting}
              disabled={isSubmitting}
              appearance="primary"
              marginLeft={16}
              onClick={submitForm}
            >
              Delegate
            </Button>
          </Pane>
        </Pane>
      )}
    </Pane>
  );
}
