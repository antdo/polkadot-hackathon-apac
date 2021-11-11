import React, { useState, useEffect } from 'react';
import {
  Pane,
  Tablist,
  Tab,
  Heading,
  Button,
  Dialog,
  TextareaField,
  TextInputField,
  SelectMenu,
  Label,
} from 'evergreen-ui';
import PaymentsTable from '../components/PaymentsTable';
import { useSubstrate } from '../substrate-lib';

const tabs = ['All', 'Incomplete', 'Completed', 'Disputed', 'Cancelled'];

const suportedCurrencies = [
  {
    label: 'Libra',
    value: 'libra',
  },
  {
    label: 'Libra USD',
    value: 'lusd',
  },
  {
    label: 'Dai',
    value: 'dai',
  },
  {
    label: 'Bitcoin',
    value: 'btc',
  },
  {
    label: 'Ethereum',
    value: 'eth',
  },
];

const paymentModel = (
  hash,
  { title, amount, description, payer, payee, createdAtHash, status}
) => ({
  id: hash,
  name: title.toHuman(),
  amount: amount.toHuman(),
  description: description.toHuman(),
  payer: payer.toJSON(),
  payee: payee.toJSON(),
  updatedAt: createdAtHash.toHuman(),
  status: status.toHuman(),
});

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
      unsub = await api.query.p2PPayment.paymentsOwned(
        accountPair.address,
        paymentHashes => {
          setPaymentIds(paymentHashes.toJSON());
        }
      );
    };

    if (accountPair) {
      asyncFetch();
      return () => {
        unsub && unsub();
      };
    }
  };

  const subscribePayments = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2PPayment.payments.multi(paymentIds, items => {
        console.log('Payments:', items);
        const paymentArr = items.map((payment, index) => {
          console.log(payment.value);
          return paymentModel(paymentIds[index], payment.value);
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

  const [paymentForm, setPaymentForm] = useState({
    name: '',
    amount: '',
    currency: {
      label: 'Libra',
      value: 'libra',
    },
    payer: '',
    description: '',
  });

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
          <PaymentsTable payments={payments}></PaymentsTable>
        </Pane>
      </Pane>

      <Dialog
        isShown={hasCreateForm}
        title="Create Payment"
        onCloseComplete={() => setHasCreateForm(false)}
      >
        <Pane>
          <TextInputField
            label="Payment name:"
            placeholder="Payment name"
            value={paymentForm.name}
            required
          />
          <Pane display="flex" alignItems="flex-end">
            <TextInputField
              flex={1}
              value={paymentForm.amount}
              label="Payment amount:"
              placeholder="Payment name"
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
          <TextInputField
            label="Payer address"
            value={paymentForm.payer}
            hint="You can specific the address of payer. If not, please leave it empty."
            placeholder="Payment name"
          />
          <TextareaField
            value={paymentForm.description}
            label="Payment description:"
            description="Please describe about the payment detail such as purpose"
            required
          />
        </Pane>
      </Dialog>
    </Pane>
  );
}
