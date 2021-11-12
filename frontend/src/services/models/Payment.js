const Payment = (id, data) => ({
  id,
  name: data.title.toHuman(),
  amount: data.amount.toHuman(),
  description: data.description.toHuman(),
  payer: data.payer.toJSON(),
  payee: data.payee.toJSON(),
  updatedAt: data.createdAtHash.toHuman(),
  status: data.status.toHuman(),
});

export default Payment;
