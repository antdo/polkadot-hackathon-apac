import React from 'react';
import { Badge } from 'evergreen-ui';

export default function PaymentStatus({ status }) {
  if (status === 'WaitingForDeposit') {
    return <Badge color="purple">Waiting For Deposit</Badge>;
  }

  if (status === 'Deposited') {
    return <Badge color="blue">Deposited</Badge>;
  }

  if (status === 'Completed') {
    return <Badge color="green">Completed</Badge>;
  }

  if (status === 'Disputed') {
    return <Badge color="red">Disputed</Badge>;
  }

  return <Badge color="neutral">Cancelled</Badge>;
}
