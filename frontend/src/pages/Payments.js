import React, { useState, useEffect } from 'react';
import { Pane, Tablist, Tab, Dialog, Button } from 'evergreen-ui';
import PaymentsTable from '../components/PaymentsTable';
import PaymentForm from '../components/PaymentForm';

import PaymentModel from '../utils/models/Payment';

import { useSubstrate } from '../substrate-lib';

const tabs = [
  'All',
  'WaitingForDeposit',
  'Deposited',
  'Completed',
  'Disputed',
  'Cancelled',
];

export default function Payments(props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasCreateForm, setHasCreateForm] = useState(false);
  const [paymentIds, setPaymentIds] = useState([]);
  const [payments, setPayments] = useState([]);

  const { api } = useSubstrate();
  const { accountPair } = props;

  const subscribePaymentsOwned = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.paymentsOwned(
        accountPair.address,
        paymentHashes => {
          setPaymentIds(paymentHashes.toJSON());
        }
      );
    };

    if (accountPair) {
      asyncFetch();
    }

    return () => {
      unsub && unsub();
    };
  };

  const subscribePayments = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.payments.multi(paymentIds, items => {
        const paymentArr = items.map((payment, index) => {
          return PaymentModel(paymentIds[index], payment.value);
        });
        setPayments(paymentArr);
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  useEffect(subscribePaymentsOwned, [accountPair]);
  useEffect(subscribePayments, [paymentIds]);

  const renderedPayments = () => {
    if (selectedIndex === 0) {
      return payments;
    }

    return payments.filter(payment => payment.status === tabs[selectedIndex]);
  };

  return (
    <Pane>
      <Pane display="flex" justifyContent="flex-end" padding={16}>
        <Pane>
          <Button appearance="primary" onClick={() => setHasCreateForm(true)}>
            Create payment
          </Button>
        </Pane>
      </Pane>
      <Pane padding={16}>
        <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
          {tabs.map((tab, index) => (
            <Tab
              key={tab}
              id={tab}
              onSelect={() => setSelectedIndex(index)}
              isSelected={index === selectedIndex}
              aria-controls={`panel-${tab}`}
            >
              {tab}
            </Tab>
          ))}
        </Tablist>
        <Pane background="tint1" flex="1">
          <PaymentsTable
            accountPair={accountPair}
            height={window.innerHeight - 164}
            payments={renderedPayments()}
          ></PaymentsTable>
        </Pane>
      </Pane>

      <Dialog
        isShown={hasCreateForm}
        title="Create Payment"
        hasFooter={false}
        onCloseComplete={() => setHasCreateForm(false)}
        shouldCloseOnOverlayClick={false}
      >
        <PaymentForm
          accountPair={accountPair}
          onFormClosed={() => {
            setHasCreateForm(false);
          }}
        />
      </Dialog>
    </Pane>
  );
}
