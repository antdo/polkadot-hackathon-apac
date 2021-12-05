sudo apt update && sudo apt install -y git clang curl libssl-dev llvm libudev-dev
curl https://sh.rustup.rs -sSf | sh
source ~/.cargo/env
rustup default stable
rustup update

rustup update nightly
rustup target add wasm32-unknown-unknown --toolchain nightly

cargo build --release