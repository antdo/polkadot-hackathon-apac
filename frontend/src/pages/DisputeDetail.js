import React, { useState, useEffect } from 'react';
import { Pane, Button, Card, Text, Code, TextareaField, Heading, Badge, toaster, Label, Dialog, Radio } from 'evergreen-ui';
import CopyableText from '../components/CopyableText';
import ImagesUploader from '../components/ImagesUploader';

import Dispute from '../utils/models/Dispute';
import Payment from '../utils/models/Payment';

import { getFromAcct } from '../utils/tx';
import { useSubstrate } from '../substrate-lib';

import shortenStr from '../utils/shortenStr';

function DisputeRole({ dispute, address }) {
  if (address === dispute.resolver.account) {
    return <Badge color="purple">Resolver</Badge>;
  }

  if (address === dispute.payer) {
    return <Badge color="blue">Payer</Badge>;
  }

  if (address === dispute.payee) {
    return <Badge color="blue">Payee</Badge>;
  }

  return '';
}

export default function DisputeDetail(props) {
  const { disputeId, accountPair } = props;

  const [payment, setPayment] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);
  const [hasDisputeResolverConfirm, setHasDisputeResolverConfirm] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState('');

  const [proofForm, setProofForm] = useState({
    provider: '',
    description: '',
    images: [],
  });

  useEffect(() => {
    if (accountPair) {
      setProofForm({
        ...proofForm,
        provider: accountPair.address,
      })
    }
  }, [accountPair]);

  const { api } = useSubstrate();

  const subscribeDispute = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.disputes(disputeId, data => {
        setDispute(Dispute(disputeId, data.value));
      });
    };

    if (disputeId) {
      asyncFetch();
    }

    return () => {
      unsub && unsub();
    };
  };

  const subscribePayment = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.payments(dispute.paymentId, paymentData => {
        setPayment(Payment(dispute.paymentId, paymentData.value));
      });
    };

    if (dispute) {
      asyncFetch();
    }

    return () => {
      unsub && unsub();
    };
  };

  useEffect(subscribeDispute, [disputeId]);
  useEffect(subscribePayment, [dispute]);

  const submitProof = async () => {
    setIsSubmittingProof(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2pPayment
        .submitProof(
          disputeId,
          Buffer.from(proofForm.description, 'utf-8').toString('base64'),
          proofForm.images.map(item => ({
            ...item,
            url: Buffer.from(item.url, 'utf-8').toString('base64'),
          }))
        )
        .signAndSend(fromAcct, ({ status }) => {
          console.log(JSON.stringify(status));
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsSubmittingProof(false);
            setProofForm({
              ...proofForm,
              description: '',
              images: [],
            });
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
          setIsSubmittingProof(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
    }
  };

  const resolveDispute = async () => {
    setIsResolvingDispute(true);

    try {
      const { fromAcct, signer } = await getFromAcct(accountPair);
      if (signer) {
        api.setSigner(signer);
      }

      api.tx.p2pPayment
        .solveDispute(
          disputeId,
          selectedWinner
        )
        .signAndSend(fromAcct, ({ status }) => {
          if (status.isFinalized) {
            toaster.success(
              `😉 Transaction finalized. Block hash: ${status.asFinalized.toString()}`
            );
            setIsResolvingDispute(false);
            setProofForm({
              ...proofForm,
              description: '',
              images: [],
            });
            setHasDisputeResolverConfirm(false);
          } else {
            toaster.notify(`Current transaction status: ${status.type}`);
          }
        })
        .catch(err => {
          toaster.danger(`😞 Transaction Failed: ${err.toString()}`);
          setIsResolvingDispute(false);
        });
    } catch (err) {
      toaster.danger(`😞 Failed: ${err.message}`);
    }
  };

  return (
    <Pane>
      {
       payment && 
       <Card elevation={1} padding={16} margin={8}>
        <Heading size={600} marginBottom={16}>Payment information</Heading>

        <Pane borderBottom="solid 1px #E6E8F0" width="100%"></Pane>

        <Pane display='flex' paddingX={16} marginTop={16}>
          <Pane flex='2 0 0' paddingRight={32}>
            <Heading size={500} marginBottom={16}>{ payment.name }</Heading>
            <Heading size={400} marginBottom={16}>{ payment.amount } Libra</Heading>
            <Pane display='flex' marginTop='16px' alignItems='center'>
              <Pane flex='1 0 0'>
                <Heading size={400}>Payer: </Heading>
              </Pane>
              <Pane flex='4 0 0'>
                <CopyableText content={payment.payer}/>
              </Pane>
            </Pane>
            <Pane display='flex' marginTop='16px' alignItems='center'>
              <Pane flex='1 0 0'>
                <Heading size={400}>Payee: </Heading>
              </Pane>
              <Pane flex='4 0 0'>
                <CopyableText content={payment.payee}/>
              </Pane>
            </Pane>

            <Pane display='flex' marginTop='16px' alignItems='center'>
              <Pane flex='1 0 0'>
                <Heading size={400}>Resolver: </Heading>
              </Pane>
              <Pane flex='4 0 0'>
                <CopyableText content={dispute && dispute.resolver.account}/>
              </Pane>
            </Pane>
          </Pane>
          <Pane flex='1 0 0' display="flex" alignItems="center">
            { payment.images[0] && <img width='100%' maxWidth='100%' src={payment.images[0].url}></img>}
          </Pane>
        </Pane>
        <Pane marginTop={16} borderBottom="solid 1px #E6E8F0" width="100%"></Pane>
        <Pane paddingX={16} marginTop={16}>
          <Code textAlign='center'>{ payment.description }</Code>
        </Pane>
        <Pane display='flex' justifyContent="center" marginTop={16}>
          <Button is="a" href={`${window.location.origin}/payments/${dispute.paymentId}`} target="_blank">View payment link</Button>
        </Pane>
      </Card>
     }

      {
        dispute && dispute.proofs.map((proof, index) => (<Card elevation={1} key={`proof-${index}`} padding={16} margin={8}>
          <Pane display='flex' flexWrap='wrap' alignItems='center'>
            <Heading size={400} marginRight={8}>
              Submitted by { proof.provider }
            </Heading>
            <DisputeRole dispute={dispute} address={proof.provider}></DisputeRole>
          </Pane>

          <Pane marginTop={16} borderBottom="solid 1px #E6E8F0" width="100%"></Pane>

          <Pane marginTop={16}>
            <Pane marginTop={16}>
              { index === 0 && <Heading size={400}>{dispute.reason}</Heading>}
            </Pane>
            <Pane marginTop={16}>
              <Text size={400}>{proof.description}</Text>
            </Pane>

            <Pane display='flex' marginTop={16}>
              { proof.images.map((image, index) => <Pane key={`proof-image-${index}`} width={136} height={136}>
                <img style={{ maxWidth: '100%', maxHeight: '100%' }} src={image.url}></img>
              </Pane>)}
            </Pane>
          </Pane>
        </Card>))
      }

      {
        (dispute &&  dispute.status === 'Processing' && (dispute.payer === accountPair.address || dispute.payee === accountPair.address)) &&
        <Card elevation={1} padding={16} margin={8}>
          <Pane display='flex' justifyContent='space-between'>
            <Pane flexGrow='1'>
              <TextareaField
                marginRight="16px"
                inputHeight="120px"
                value={proofForm.description}
                onInput={e => setProofForm({ ...proofForm, description: e.target.value })}
                label="Add information:"
                description="If you have more information, please submit here"
                required
              />
            </Pane>
            
            <Pane height={160} width={160} marginTop={8}>
              <ImagesUploader
                baseKey={accountPair.address}
                onImagesUploaded={images => setProofForm({ ...proofForm, images })}
              />
            </Pane>
          </Pane>

          <Pane display="flex" justifyContent="flex-end">
            <Button appearance="primary" onClick={submitProof} isLoading={isSubmittingProof}>Submit</Button>
          </Pane>
        </Card>
      }

      {
        (dispute && dispute.status === 'Processing' && (dispute.resolver.account === accountPair.address)) && 
        <Card elevation={1} padding={16} margin={8}>
          <TextareaField
            marginRight="16px"
            inputHeight="120px"
            value={proofForm.description}
            onInput={e => setProofForm({ ...proofForm, description: e.target.value })}
            label="Message:"
            description="If you need more information for the investiagation, please request here"
            required
          />

          <Pane display="flex" justifyContent="flex-end" paddingX={16}>
            <Button appearance="primary" marginRight={16} onClick={() => setHasDisputeResolverConfirm(true)}>Resolve dispute</Button>
            <Button appearance="primary" onClick={submitProof} isLoading={isSubmittingProof}>Send message</Button>
          </Pane>
        </Card>
      }

{
        (dispute && dispute.status === 'Resolved') && 
        <Card elevation={1} padding={16} margin={8} display='flex' alignItems='center' justifyContent='center'>
          <Heading>This dispute has been resolved</Heading>
        </Card>
      }

      <Dialog
        isShown={hasDisputeResolverConfirm}
        title="Resolve dispute"
        hasFooter={false}
        onCloseComplete={() => setHasDisputeResolverConfirm(false)}
        shouldCloseOnOverlayClick={false}
      >
        {
          !!dispute && (
          <Pane role="group">
            <Label>
              Please select who is the winner of the dispute?
            </Label>
            <Pane marginTop={8}>
              <Pane display='flex' alignItems='center'>
                <Radio marginRight={8} name="selectedWinner" label={shortenStr(dispute.payer)} onClick={() => { setSelectedWinner(dispute.payer)}} />
                <DisputeRole dispute={dispute} address={dispute.payer}></DisputeRole>
              </Pane>
              <Pane display='flex' alignItems='center'>
                <Radio marginRight={8} name="selectedWinner" label={shortenStr(dispute.payee)} onClick={() => { setSelectedWinner(dispute.payee)}}/>
                <DisputeRole dispute={dispute} address={dispute.payee}></DisputeRole>
              </Pane>
            </Pane>
          </Pane>)
        }
        <Pane display='flex' justifyContent='flex-end' marginTop={24} marginBottom={16} paddingRight={16}>
          <Button marginRight={16} disabled={isResolvingDispute}>Discard</Button>
          <Button appearance="primary" onClick={resolveDispute} disabled={isResolvingDispute} isLoading={isResolvingDispute}>Confirm</Button>
        </Pane>
      </Dialog> 
    </Pane>
  );
}
