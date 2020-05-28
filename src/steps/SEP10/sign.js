const Config = require("src/config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction:
    "We've received a challenge transaction from the server that we need the sending anchor to sign with their Stellar private key.",
  action: "Sign Challenge (SEP-0010)",
  execute: async function(state, { logObject }) {
    const USER_SK = Config.get("SENDER_SK");
    const challenge_xdr = state.challenge_transaction;
    const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(
      challenge_xdr,
      "base64",
    );
    const transaction = new StellarSdk.Transaction(envelope, state.network);
    transaction.sign(StellarSdk.Keypair.fromSecret(USER_SK));
    logObject("SEP-0010 Signed Transaction", transaction);
    logObject("Base64 Encoded", transaction.toEnvelope().toXDR("base64"));
    state.signed_challenge_tx = transaction;
  },
};
