import React, { useState, useEffect } from 'react';
import { Pane, Tablist, Tab } from 'evergreen-ui';
import PayHistoryTable from '../components/PayHistoryTable';

import PaymentModel from '../utils/models/Payment';

import { useSubstrate } from '../substrate-lib';

const tabs = ['All', 'Deposited', 'Completed', 'Disputed', 'Cancelled'];

export default function Payments(props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paymentIds, setPaymentIds] = useState([]);
  const [payments, setPayments] = useState([]);

  const { api } = useSubstrate();
  const { accountPair } = props;

  const subscribePaymentsOwned = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2PPayment.payHistory(
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
      unsub = await api.query.p2PPayment.payments.multi(paymentIds, items => {
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
          <PayHistoryTable
            height={window.innerHeight - 164}
            payments={renderedPayments()}
          ></PayHistoryTable>
        </Pane>
      </Pane>
    </Pane>
  );
}
