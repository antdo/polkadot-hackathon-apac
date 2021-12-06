import React, { useState } from 'react';
import {
  Pane,
  Button,
  TextareaField,
  TextInputField,
  toaster,
} from 'evergreen-ui';

import { getFromAcct } from '../utils/tx';

import { useSubstrate } from '../substrate-lib';

export default function PaymentForm(props) {
  const { accountPair, onFormClosed } = props;

  const [form, setForm] = useState({
    name: '',
    application: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { api } = useSubstrate();

  const updateForm = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const submitForm = async () => {
    setIsSubmitting(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2pPayment
        .applyToBeResolver(
          Buffer.from(form.name, 'utf-8').toString('base64'),
          Buffer.from(form.application, 'utf-8').toString('base64')
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
      <TextInputField
        label="Name:"
        placeholder="Your name"
        value={form.name}
        onInput={e => updateForm('name', e.target.value)}
        required
      />
      <TextareaField
        value={form.application}
        onInput={e => updateForm('application', e.target.value)}
        label="Application"
        description="Please describe about the your detail information and experience"
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
          Save
        </Button>
      </Pane>
    </Pane>
  );
}
