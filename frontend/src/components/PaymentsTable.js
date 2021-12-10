import React, { useState } from 'react';
import {
  Pane,
  Table,
  Tooltip,
  IconButton,
  DuplicateIcon,
  SmallCrossIcon,
  TakeActionIcon,
  Dialog,
} from 'evergreen-ui';
import PaymentStatus from './PaymentStatus';
import DisputeForm from './DisputeForm';
import CancelPaymentConfirmation from './CancelPaymentConfirmation';
import copyToClipBoard from '../utils/copyToClipboard';

export default function PaymentsTable(props) {
  const { payments, height, accountPair } = props;
  const [disputingPayment, setDisputingPayment] = useState(null);
  const [cancellingPayment, setCancellingPayment] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Pane height={height}>
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Amount</Table.TextHeaderCell>
          <Table.TextHeaderCell>Description</Table.TextHeaderCell>
          <Table.TextHeaderCell>Updated at</Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">Status</Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">Action</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {payments.map(payment => (
            <Table.Row key={payment.id} isSelectable>
              <Table.TextCell>{payment.name}</Table.TextCell>
              <Table.TextCell>{payment.amount}</Table.TextCell>
              <Table.TextCell isNumber>{payment.description}</Table.TextCell>
              <Table.TextCell>{payment.updatedAt}</Table.TextCell>
              <Table.TextCell>
                <Pane display='flex' justifyContent='center'>
                  <PaymentStatus status={payment.status}></PaymentStatus>
                </Pane>
              </Table.TextCell>
              <Table.TextCell onMouseLeave={() => setIsCopied(false)}>
                <Pane display="flex" justifyContent="center">
                  <Tooltip content={isCopied ? 'Copied' : 'Copy URL'}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        copyToClipBoard(
                          `${window.location.origin}/payments/${payment.id}`
                        );
                        setIsCopied(true);
                      }}
                      marginRight={8}
                      icon={<DuplicateIcon size={12} />}
                    />
                  </Tooltip>

                  <Tooltip content="Dispute this payment">
                    <IconButton
                      size="small"
                      disabled={payment.status !== 'Deposited'}
                      onClick={() => setDisputingPayment(payment)}
                      marginRight={8}
                      icon={<TakeActionIcon size={12} />}
                    />
                  </Tooltip>

                  <Tooltip content="Cancel this payment">
                    <IconButton
                      size="small"
                      disabled={payment.status === 'Completed' || payment.status === 'Cancelled'}
                      onClick={() => setCancellingPayment(payment)}
                      marginRight={8}
                      icon={<SmallCrossIcon size={12} />}
                    />
                  </Tooltip>
                </Pane>
              </Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Dialog
        isShown={!!disputingPayment}
        title="Dispute payment"
        hasFooter={false}
        onCloseComplete={() => setDisputingPayment(null)}
        shouldCloseOnOverlayClick={false}
      >
        <Pane>
          {disputingPayment && (
            <DisputeForm
              accountPair={accountPair}
              paymentId={disputingPayment.id}
              onFormClosed={() => setDisputingPayment(null)}
            ></DisputeForm>
          )}
        </Pane>
      </Dialog>

      <Dialog
        isShown={!!cancellingPayment}
        title="Are you sure that you want to cancel this payment?"
        hasFooter={false}
        onCloseComplete={() => setCancellingPayment(null)}
        shouldCloseOnOverlayClick={false}
      >
        <Pane>
          {cancellingPayment && (
            <CancelPaymentConfirmation
              accountPair={accountPair}
              payment={cancellingPayment}
              onClosed={() => setCancellingPayment(null)}
            ></CancelPaymentConfirmation>
          )}
        </Pane>
      </Dialog>
    </Pane>
  );
}
