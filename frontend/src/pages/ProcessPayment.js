import React, { useState, useEffect } from 'react';
import {
  Pane,
  Spinner,
  Text,
  Heading,
  Button,
  Code,
  toaster,
  TextInputField,
  TextareaField,
  SelectField,
  Dialog,
} from 'evergreen-ui';
import { useParams } from 'react-router';
import PaymentStatus from '../components/PaymentStatus';
import ImagesUploader from '../components/ImagesUploader';

import { useSubstrate } from '../substrate-lib';
import PaymentModel from '../utils/models/Payment';
import { getFromAcct } from '../utils/tx';
import isValidAddress from '../utils/isValidAddress';

export default function ProcessPayment(props) {
  const { id } = useParams();

  const [payment, setPayment] = useState(null);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accountPair, setAccountPair] = useState(null);

  const [disputeFormShowed, setIsDisputeFormShowed] = useState(false);
  const [disputeFormData, setDisputeFormData] = useState({
    paymentId: id,
    reason: '',
    description: '',
    images: [],
  });

  const { api, keyring } = useSubstrate();

  const options = keyring.getPairs().map(account => ({
    address: account.address,
    name: account.meta.name,
  }));

  useEffect(() => {
    setSelectedAccount(options[0].address);
  }, []);

  useEffect(() => {
    if (payment && payment.payer) {
      setSelectedAccount(payment.payer);
    }
  }, [payment]);

  useEffect(() => {
    if (selectedAccount && !!options.find(item => item.address === selectedAccount)) {
      setAccountPair(keyring.getPair(selectedAccount));
    }
  }, [selectedAccount]);

  const subscribePayment = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2PPayment.payments(id, payment => {
        setPayment(PaymentModel(id, payment.value));
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  useEffect(subscribePayment, [id]);

  const depositPayment = async () => {
    setIsDepositing(true);
    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2PPayment
        .depositPayment(payment.id)
        .signAndSend(fromAcct, ({ status }) => {
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsDepositing(false);
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
          setIsDepositing(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
      setIsDepositing(false);
    }
  };

  const completePayment = async () => {
    setIsReleasing(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2PPayment
        .completePayment(payment.id)
        .signAndSend(fromAcct, ({ status }) => {
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsReleasing(false);
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
          setIsReleasing(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
      setIsReleasing(false);
    }
  };

  const disputePayment = async () => {
    setIsDisputing(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2PPayment
        .disputePayment(
          payment.id,
          Buffer.from(disputeFormData.reason, 'utf-8').toString('base64'),
          Buffer.from(disputeFormData.description, 'utf-8').toString('base64'),
          disputeFormData.images.map(item => ({
            ...item,
            url: Buffer.from(item.url, 'utf-8').toString('base64'),
          })),
        )
        .signAndSend(fromAcct, ({ status, events, dispatchError }) => {
          if (status.isFinalized) {
            toaster.success(
              `Dispute the payment successfully. Block hash: ${status.asFinalized.toString()}`
            );
            setIsDisputing(false);
            setIsDisputeFormShowed(false);
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
            toaster.notify(`Current transaction status: ${status.toString()}`);
          }
        })
        .catch(err => {
          toaster.danger(`Fail to dispute the payment: ${err.toString()}`);
          setIsDisputing(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
      setIsDisputing(false);
    }
  };

  // const cancelPayment = async () => {
  //   setIsCancelling(true);

  //   try {
  //     const { fromAcct, signer } = await getFromAcct(accountPair);
  //     if (signer) {
  //       api.setSigner(signer);
  //     }

  //     api.tx.p2PPayment
  //       .cancelPayment(payment.id)
  //       .signAndSend(fromAcct, ({ status }) => {
  //         if (status.isFinalized) {
  //           toaster.success(
  //             `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
  //           );
  //           setIsCancelling(false);
  //         } else {
  //           toaster.notify(`Current transaction status: ${status.type}`);
  //         }
  //       })
  //       .catch(err => {
  //         toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
  //         setIsCancelling(false);
  //       });
  //   } catch (err) {
  //     toaster.danger(`😞 Failed: ${err.message}`);
  //   }
  // };

  if (!payment) {
    return (
      <Pane
        width="100%"
        height={window.innerHeight - 160}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size={24} marginRight={8}></Spinner>
        <Text>Loading the payemnt infomation</Text>
      </Pane>
    );
  }

  return (
    <Pane
      position="fixed"
      width="100vw"
      height="100vh"
      top="0"
      left="0"
      zIndex={3}
      display="flex"
      background="tint2"
    >
      <Pane
        flex="1 0 0"
        background="greenTint"
        paddingY={96}
        paddingRight={48}
        display="flex"
        justifyContent="flex-end"
      >
        <Pane width={480}>
          <Pane display="flex">
            <Pane width="160px" minWidth="160px">
              <img width="100%" src={(payment.images[0] || {}).url}></img>
            </Pane>

            <Pane paddingLeft="32px">
              <Pane>
                <Text size={500} marginRight={8}>
                  {payment.name}
                </Text>
                <PaymentStatus status={payment.status}></PaymentStatus>
              </Pane>
              <Heading marginTop={16} size={700}>
                {payment.amount} libra
              </Heading>
            </Pane>
          </Pane>
          <Pane borderTop="solid 1px #c1c4d6" marginTop={16} paddingTop={16}>
            <Heading size={500}>About this payment</Heading>
            <Pane marginTop={16}>
              <Code size={300} appearance="minimal" whiteSpace="pre-wrap">
                {payment.description}
              </Code>
            </Pane>
          </Pane>
        </Pane>
      </Pane>
      <Pane
        flex="1 0 0"
        background="white"
        elevation={1}
        paddingLeft={48}
        paddingY={96}
      >
        <Pane maxWidth={420}>
          <Heading size={600} marginBottom={32}>
            Payment detail
          </Heading>

          <TextInputField
            label="Receiver"
            description="The fund will be transfer to this address after payment completed"
            value={payment.payee}
            readOnly
            disabled
          />

          <Pane display="flex">
            <TextInputField
              flexGrow="1"
              label="Amount"
              value={payment.amount}
              marginRight={16}
              disabled
              readOnly
            />
            <TextInputField
              width="80px"
              label="Currency"
              value="libra"
              readOnly
              disabled
            />
          </Pane>

          <Pane>
            <SelectField
              label="Pay with"
              description="Select the wallet that use to pay"
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              disabled={isValidAddress(payment.payer)}
            >
              {options.map(option => (
                <option key={option.address} value={option.address}>
                  {option.name}
                </option>
              ))}
            </SelectField>
          </Pane>

          <Pane marginTop={32} display="flex" justifyContent="flex-end">
            {payment.status === 'WaitingForDeposit' && (
              <Button
                onClick={depositPayment}
                isLoading={isDepositing}
                disabled={isDepositing}
                size="medium"
                appearance="primary"
              >
                Deposit
              </Button>
            )}

            {payment.status === 'Deposited' && (
              <Button
                onClick={() => setIsDisputeFormShowed(true)}
                isLoading={isDisputing}
                disabled={isDisputing || isReleasing}
                size="medium"
                marginRight={16}
                appearance="primary"
                intent="danger"
              >
                Dispute
              </Button>
            )}

            {payment.status === 'Deposited' && (
              <Button
                onClick={completePayment}
                isLoading={isReleasing}
                disabled={isReleasing || isDisputing}
                size="medium"
                appearance="primary"
              >
                Realease fund
              </Button>
            )}
          </Pane>
        </Pane>
      </Pane>
      <Dialog
        isShown={disputeFormShowed}
        title="Dispute payment"
        hasFooter={false}
        onCloseComplete={() => setIsDisputeFormShowed(false)}
        shouldCloseOnOverlayClick={false}
      >
          <TextInputField
            label="Dispute reason"
            placeholder="Dispute reason"
            value={disputeFormData.reason}
            onInput={e => setDisputeFormData({ ...disputeFormData, reason: e.target.value })}
            required
          />

          <Pane display='flex' justifyContent='space-between'>
            <Pane flexGrow='1'>
              <TextareaField
                marginRight="16px"
                inputHeight="120px"
                value={disputeFormData.description}
                onInput={e => setDisputeFormData({ ...disputeFormData, description: e.target.value })}
                label="Proof description:"
                description="Please describe the proof of dispute"
                required
              />
            </Pane>
            
            <Pane height={160} width={160} marginTop={8}>
              <ImagesUploader
                baseKey={accountPair.address}
                onImagesUploaded={images => setDisputeFormData({ ...disputeFormData, images })}
              />
            </Pane>
          </Pane>
          <Pane marginY={16} display='flex' justifyContent='flex-end'>
            <Button onClick={() => { setIsDisputeFormShowed(false) }}>Discard</Button>
            <Button
              appearance='primary'
              marginLeft={8}
              isLoading={isDisputing}
              disabled={isDisputing}
              onClick={() => disputePayment()}
            >Submit dispute</Button>
          </Pane>
      </Dialog>
    </Pane>
  );
}
