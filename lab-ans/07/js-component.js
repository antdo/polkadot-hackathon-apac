const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");

// Substrate connection config
const WEB_SOCKET = "ws://localhost:9944";

// This script will wait for n secs before stopping itself
const LASTING_SECS = 30;

const ALICE = "//Alice";
const BOB = "//Bob";

// This is 1 Unit
const TX_AMT = 1000000000000000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectSubstrate = async () => {
  const wsProvider = new WsProvider(WEB_SOCKET);

  const api = await ApiPromise.create({ provider: wsProvider });

  return api;
};

const submitTx = async (api, src, dest, amt) => {
  return await api.tx.balances
    .transfer(dest.address, amt)
    .signAndSend(src, (result) => {
      console.log(`Current status is ${result.status}`);

      if (result.status.isInBlock) {
        console.log(
          `Transaction included at blockHash ${result.status.asInBlock}`
        );
      } else if (result.status.isFinalized) {
        console.log(
          `Transaction finalized at blockHash ${result.status.asFinalized}`
        );
      }
    });
};

const main = async () => {
  const api = await connectSubstrate();
  const keyring = new Keyring({ type: "sr25519" });
  console.log("Connected to Substrate");

  const alice = keyring.addFromUri(ALICE);
  const bob = keyring.addFromUri(BOB);

  // TODO #2: Modify the RHS of the assignment to get the existential deposit of `pallet-balances`.
  const existentialDeposit = api.consts.balances.existentialDeposit.toNumber();

  console.log(`Balance existentialDeposit: ${existentialDeposit}`);

  const aliceAccount = await api.query.system.account(alice.address);

  console.log(`Alice Account: ${aliceAccount}`);

  const aliceFreeBalance = aliceAccount.data.free;

  console.log(`Alice free balance in readable format: ${aliceFreeBalance}`);

  submitTx(api, alice, bob, TX_AMT);

  const metadata = await api.rpc.state.getMetadata();

  // `metadata` is a big JSON blob, so the following log is commented out. Uncomment to see the
  //   actual chain metadata.
  // console.log(`Chain Metadata: ${JSON.stringify(metadata, null, 2)}`);

  await sleep(LASTING_SECS * 1000);
};

main()
  .then(() => {
    console.log("successfully exited");
    process.exit(0);
  })
  .catch((err) => {
    console.log("error occur:", err);
    process.exit(1);
  });
