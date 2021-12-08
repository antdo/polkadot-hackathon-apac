import React, { useState } from 'react';
import {
  Pane,
  Button,
  TextareaField,
  TextInputField,
  toaster,
} from 'evergreen-ui';

import ImagesUploader from './ImagesUploader';

import { getFromAcct } from '../utils/tx';

import { useSubstrate } from '../substrate-lib';

export default function PaymentForm(props) {
  const { accountPair, paymentId, onFormClosed } = props;

  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { api } = useSubstrate();

  const updateFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const discardForm = () => {
    if (onFormClosed) {
      onFormClosed();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2pPayment
        .disputePayment(
          paymentId,
          Buffer.from(formData.reason, 'utf-8').toString('base64'),
          Buffer.from(formData.description, 'utf-8').toString('base64'),
          formData.images.map(item => ({
            ...item,
            url: Buffer.from(item.url, 'utf-8').toString('base64'),
          })),
        )
        .signAndSend(fromAcct, ({ status, events, dispatchError }) => {
          if (status.isFinalized) {
            toaster.success(
              `Dispute the payment successfully. Block hash: ${status.asFinalized.toString()}`
            );
            setIsSubmitting(false);
            onFormClosed && onFormClosed();
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`Fail to dispute the payment: ${err.toString()}`);
          setIsSubmitting(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <Pane>
      <TextInputField
        label="Dispute reason"
        placeholder="Dispute reason"
        value={formData.reason}
        onInput={e => updateFormData('reason', e.target.value)}
        required
      />

      <Pane display="flex" justifyContent="space-between">
        <Pane flexGrow="1">
          <TextareaField
            marginRight="16px"
            inputHeight={120}
            value={formData.description}
            onInput={e => updateFormData('description', e.target.value)}
            label="Proof description:"
            description="Please describe the proof of dispute"
            required
          />
        </Pane>

        <Pane height={160} width={160} marginTop={8}>
          <ImagesUploader
            baseKey={accountPair.address}
            onImagesUploaded={images =>
              updateFormData('images', images)
            }
          />
        </Pane>
      </Pane>
      <Pane marginY={16} display="flex" justifyContent="flex-end">
        <Button
          disabled={isSubmitting}
          onClick={() => {
            discardForm();
          }}
        >
          Discard
        </Button>
        <Button
          appearance="primary"
          marginLeft={8}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          onClick={() => submitForm()}
        >
          Submit dispute
        </Button>
      </Pane>
    </Pane>
  );
}
