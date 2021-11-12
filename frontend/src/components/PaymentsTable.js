import React from 'react';
import { Pane, Table } from 'evergreen-ui';

export default function PaymentsTable(props) {
  const { payments, height } = props;

  return (
    <Pane>
      <Table height={height}>
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
              <Table.TextCell>{payment.name}</Table.TextCell>
              <Table.TextCell>{payment.amount}</Table.TextCell>
              <Table.TextCell isNumber>{payment.description}</Table.TextCell>
              <Table.TextCell>{payment.updatedAt}</Table.TextCell>
              <Table.TextCell>{payment.status}</Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Pane>
  );
}
