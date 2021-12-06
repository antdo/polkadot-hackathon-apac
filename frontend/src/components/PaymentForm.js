import React, { useState } from 'react';
import {
  Pane,
  Label,
  Button,
  TextareaField,
  TextInputField,
  SelectMenu,
  toaster,
} from 'evergreen-ui';

import ImagesUploader from './ImagesUploader';

import suportedCurrencies from '../utils/supportedCurrencies';
import { getFromAcct } from '../utils/tx';

import { useSubstrate } from '../substrate-lib';

export default function PaymentForm(props) {
  const { accountPair, onFormClosed } = props;

  const [paymentForm, setPaymentForm] = useState({
    name: '',
    amount: '',
    currency: {
      label: 'Libra',
      value: 'libra',
    },
    payer: '',
    description: '',
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { api } = useSubstrate();

  const updatePaymentForm = (field, value) => {
    setPaymentForm({
      ...paymentForm,
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
        .createPayment(
          Buffer.from(paymentForm.name, 'utf-8').toString('base64'),
          Buffer.from(paymentForm.description, 'utf-8').toString('base64'),
          `${Number.parseInt(paymentForm.amount * 10 ** 12)}`,
          paymentForm.payer,
          paymentForm.images.map(item => ({
            ...item,
            url: Buffer.from(item.url, 'utf-8').toString('base64'),
          }))
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
      <Pane display="flex" justifyContent="space-between">
        <Pane flex="2 0 0" paddingRight="16px">
          <TextInputField
            label="Payment name:"
            placeholder="Payment name"
            value={paymentForm.name}
            onInput={e => updatePaymentForm('name', e.target.value)}
            required
          />
          <Pane display="flex" alignItems="flex-end">
            <TextInputField
              flex={1}
              value={paymentForm.amount}
              onInput={e => updatePaymentForm('amount', e.target.value)}
              label="Payment amount:"
              placeholder="Amount of currency"
              required
            />

            <Pane
              display="flex"
              flexDirection="column"
              marginLeft="8px"
              marginBottom="24px"
              width="80px"
            >
              <Label marginBottom="8px">Currency:</Label>
              <SelectMenu
                title="Select name"
                options={suportedCurrencies}
                selected={paymentForm.currency}
                hasFilter={false}
                hasTitle={false}
                onSelect={item =>
                  setPaymentForm({ ...paymentForm, currency: item })
                }
              >
                <Button>{paymentForm.currency.label}</Button>
              </SelectMenu>
            </Pane>
          </Pane>
        </Pane>
        <Pane flex="1 0 0" paddingLeft="16px">
          <ImagesUploader
            baseKey={accountPair.address}
            onImagesUploaded={images => updatePaymentForm('images', images)}
          />
        </Pane>
      </Pane>

      <TextInputField
        label="Payer address"
        value={paymentForm.payer}
        onInput={e => updatePaymentForm('payer', e.target.value)}
        hint="You can specific the address of payer. If not, please leave it empty."
        placeholder="Payer address"
      />

      <TextareaField
        marginRight="16px"
        inputHeight="120px"
        value={paymentForm.description}
        onInput={e => updatePaymentForm('description', e.target.value)}
        label="Payment description:"
        description="Please describe about the payment detail such as purpose"
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
