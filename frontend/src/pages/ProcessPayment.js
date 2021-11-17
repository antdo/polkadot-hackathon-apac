import React, { useState, useEffect } from 'react';
import { Pane, Spinner, Text, Heading, Button, toaster } from 'evergreen-ui';
import { useParams } from 'react-router';
import PaymentStatus from '../components/PaymentStatus';

import { useSubstrate } from '../substrate-lib';
import PaymentModel from '../services/models/Payment';
import { getFromAcct } from '../utils/tx';

export default function ProcessPayment(props) {
  const { id } = useParams();
  const { accountPair } = props;

  const [payment, setPayment] = useState(null);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { api } = useSubstrate();

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
    }
  };

  const cancelPayment = async () => {
    setIsCancelling(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2PPayment
        .cancelPayment(payment.id)
        .signAndSend(fromAcct, ({ status }) => {
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsCancelling(false);
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
    <Pane>
      <Pane maxWidth="320px" margin="auto" paddingTop="48px">
        <Pane>
          <Text size={500} marginRight={8}>
            {payment.name}
          </Text>
        </Pane>

        <Pane marginTop={8}>
          <PaymentStatus status={payment.status}></PaymentStatus>
        </Pane>

        <Heading marginTop={16} size={600}>
          {payment.amount} libra
        </Heading>
        <Pane marginTop="16px">
          <Text size={400} marginTop={32}>
            {payment.description}
          </Text>
        </Pane>
        {accountPair && accountPair.address && (
          <Pane marginTop={32} display="flex" justifyContent="flex-start">
            {payment.status !== 'Completed' &&
              payment.status !== 'Cancelled' &&
              accountPair.address === payment.payee && (
                <Button
                  onClick={cancelPayment}
                  isLoading={isCancelling}
                  marginRight={8}
                  intent="danger"
                >
                  Cancel payment
                </Button>
              )}

            {payment.status === 'Deposited' &&
              (accountPair.address === payment.payee ||
                accountPair.address === payment.payer) && (
                <Button marginRight={8} intent="danger">
                  Dispute
                </Button>
              )}

            {payment.status === 'WaitingForDeposit' &&
              accountPair.address !== payment.payee && (
                <Button
                  marginRight={8}
                  isLoading={isDepositing}
                  onClick={depositPayment}
                  appearance="primary"
                >
                  Deposit
                </Button>
              )}

            {payment.status === 'Deposited' &&
              accountPair.address === payment.payer && (
                <Button
                  isLoading={isReleasing}
                  onClick={completePayment}
                  marginRight={8}
                  intent="success"
                >
                  Release Fund
                </Button>
              )}
          </Pane>
        )}
      </Pane>
    </Pane>
  );
}
