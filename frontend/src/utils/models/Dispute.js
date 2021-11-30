const Dispute = (id, data) => ({
  id,
  reason: Buffer.from(data.reason.toHuman(), 'base64').toString('utf-8'),
  issuer: data.issuer.toString(),
  payer: data.payer.toString(),
  payee: data.payee.toString(),
  resolver: data.resolver.toHuman(),
  paymentId: data.paymentId.toString(),
  status: data.status.toHuman(),
  proofs: data.proofs.map(proof => ({
    provider: proof.provider.toString(),
    description: Buffer.from(proof.description.toHuman(), 'base64').toString('utf-8'),
    images: proof.images.toHuman().map(image => ({
      proof: image.proof,
      url: Buffer.from(image.url, 'base64').toString('utf-8'),
    })),
  })),
});

export default Dispute;
