# Project Libra
Payment network for web 3

## Live application

The live running web application endpoint: https://app.libra.atscale.xyz

The wss enpoint: wss://rpc.libra.atscale.xyz

The explorer endpoint: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.libra.atscale.xyz#/explorer

### Create a testnet account

- To create a testnet account, please go to https://polkadot.js.org/extension/ and install PolkadotJs extension

- Go to the faucet page at https://app.libra.atscale.xyz/faucet to get the Libra tokens 

### How to become a resolver

- Go to https://app.libra.atscale.xyz/resolvers
- Click at `Apply to be resolver`
- Input your application and submit
- Resolver require to stake 100 0000 Libra and nomination 100 0000 Libra from the community to become an active resolver

### Complete your first payment
- Go to https://app.libra.atscale.xyz/
- Click at `Create payment`
- Copy your payment URL and send it to your buyer
- Ask your buyer to deposit the libra tokens
- Once you delivered your order, ask your buyer to release the tokens to you
- If there are any conflicts, please create a dispute with your evidence
- An random resolver will be assigned to resolve your dispute
## Libra node

### Setup and build

```bash
sudo apt update && sudo apt install -y git clang curl libssl-dev llvm libudev-dev
curl https://sh.rustup.rs -sSf | sh
source ~/.cargo/env
rustup default stable
rustup update
rustup update nightly
rustup target add wasm32-unknown-unknown --toolchain nightly


cd polkadot-hackathon-apac/libra-node
cargo build --release

```

### Run local chain
Single node development chain with tmp data storage

```bash
./target/release/hydra-dx --dev --tmp
```

### Testnet node
Runing a node of testnet
```
./target/release/node-template \
--chain="./specs/testnet-raw.json" \
--port 30333 \
--ws-port 9944 \
--rpc-port 9933 \
--rpc-cors all \
--rpc-methods Unsafe \
--name Yourname

```

## Web application

### Development
Start development webapp connect to `ws://127.0.0.1:9944`

```js
cd frontend 
yarn && yarn start
```

### Staging
Staging environment which is connected to `wss://rpc.libra.atscale.xyz`

```js
cd frontend 

yarn && yarn build

serve build
```

