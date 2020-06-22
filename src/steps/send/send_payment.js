//const Config = require("../../config")
const StellarSDK = require("stellar-sdk");

module.exports = {
  instruction: "Send stellar payment to receiving anchor",
  action: "POST HORIZON_URL/transaction",
  execute: async function(state, { request, response, instruction, expect }) {
    const keypair = StellarSDK.Keypair.fromSecret(Config.get("SENDER_SK"));
    const server = new StellarSDK.Server(state.horizonURL);
    let tx = new StellarSDK.TransactionBuilder(
      await server.loadAccount(keypair.publicKey()),
      {
        fee: StellarSDK.BASE_FEE * 5,
        networkPassphrase: state.network,
      },
    )
      .addOperation(
        StellarSDK.Operation.Payment({
          destination: state.receiver_address,
          amount: "100",
          asset: StellarSdk.Asset(state.asset_code, Config.get("ASSET_ISSUER")),
        }),
      )
      .addMemo(StellarSDK.Memo(state.send_memo_type, state.send_memo))
      .setTimeout(30)
      .build();
    tx.sign(keypair);
    let resp;
    try {
      resp = await server.submitTransaction(tx);
    } catch (e) {
      const data = e.response.data;
      const status = data.status;
      const txStatus = data.extras.result_codes.transaction;
      const codes = data.extras.result_codes.operations;
      const codesList = codes ? codes.join(", ") : "";
      expect(
        false,
        `Sending transaction failed with error code ${status}: ${txStatus}, ${codesList}`,
      );
    }
  },
};
