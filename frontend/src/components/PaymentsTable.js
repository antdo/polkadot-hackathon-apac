import React from 'react';
import { Pane, Table, Tooltip, IconButton, DuplicateIcon } from 'evergreen-ui';
import PaymentStatus from './PaymentStatus';
import copyToClipBoard from '../utils/copyToClipboard';

export default function PaymentsTable(props) {
  const { payments, height } = props;

  return (
    <Pane height={height}>
      <Table>
        <Table.Head>
          <Table.SearchHeaderCell />
          <Table.TextHeaderCell>Amount</Table.TextHeaderCell>
          <Table.TextHeaderCell>Description</Table.TextHeaderCell>
          <Table.TextHeaderCell>Updated at</Table.TextHeaderCell>
          <Table.TextHeaderCell>Status</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {payments.map(payment => (
            <Table.Row key={payment.id} isSelectable>
              <Table.TextCell>
                <Tooltip content="Copy payment url">
                  <IconButton
                    size="small"
                    onClick={() => {
                      copyToClipBoard(
                        `${window.location.origin}/payments/${payment.id}`
                      );
                    }}
                    marginRight={16}
                    icon={<DuplicateIcon size={12} />}
                  />
                </Tooltip>
                {payment.name}
              </Table.TextCell>
              <Table.TextCell>{payment.amount}</Table.TextCell>
              <Table.TextCell isNumber>{payment.description}</Table.TextCell>
              <Table.TextCell>{payment.updatedAt}</Table.TextCell>
              <Table.TextCell>
                <PaymentStatus status={payment.status}></PaymentStatus>
              </Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Pane>
  );
}
