# Project Libra
Payment network for web 3

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

