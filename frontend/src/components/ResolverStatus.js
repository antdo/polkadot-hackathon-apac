import React from 'react';
import { Badge } from 'evergreen-ui';

export default function ResolverStatus({ status }) {
  if (status === 'Active') {
    return <Badge color="green">Active</Badge>;
  }

  if (status === 'Banned') {
    return <Badge color="red">Banned</Badge>;
  }

  return <Badge color="purple">Candidate</Badge>;
}
