const Config = require("../../config");
const StellarSDK = require("stellar-sdk");

module.exports = {
  instruction: "Send stellar payment to receiving anchor",
  action: "POST HORIZON_URL/transaction",
  execute: async function(state, { request, response, instruction, expect }) {
    const keypair = StellarSDK.Keypair.fromSecret(Config.get("SENDER_SK"));
    const server = new StellarSDK.Server(state.horizonURL);
    const asset = new StellarSDK.Asset(
      state.asset_code,
      Config.get("ASSET_ISSUER"),
    );
    const account = await server.loadAccount(keypair.publicKey());
    const amount = Number(state.all_field_values.amount.amount);
    accountBalance = account.balances.find(
      (b) =>
        b.asset_code === asset.getCode() &&
        b.asset_issuer === asset.getIssuer(),
    );
    if (!accountBalance) {
      instruction(`Adding trustline to ${asset.getCode()} for sending anchor`);
      let tx = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE * 5,
        networkPassphrase: state.network,
      })
        .addOperation(StellarSDK.Operation.changeTrust({ asset: asset }))
        .setTimeout(30)
        .build();
      tx.sign(keypair);
      submitTransaction(tx, server);
    }
    // TODO: if balance is insufficient, add amount of requested asset
    expect(
      accountBalance && Number(accountBalance.balance) >= amount,
      `The sending anchor doesn't have enough ${state.asset_code}!`,
    );
    let memo;
    try {
      const memoType = {
        text: StellarSdk.Memo.text,
        id: StellarSdk.Memo.id,
        hash: StellarSdk.Memo.hash,
      }[state.stellar_memo_type];
      if (state.stellar_memo_type == "hash") {
        memo = memoType(
          Buffer.from(state.stellar_memo, "base64").toString("hex"),
        );
      } else {
        memo = memoType(state.stellar_memo);
      }
    } catch (e) {
      expect(
        false,
        `The memo '${state.stellar_memo}' could not be encoded to type ${state.stellar_memo_type}`,
      );
    }
    let tx = new StellarSDK.TransactionBuilder(account, {
      fee: StellarSDK.BASE_FEE * 5,
      networkPassphrase: state.network,
    })
      .addOperation(
        StellarSDK.Operation.payment({
          destination: state.receiver_address,
          amount: state.all_field_values.amount.amount,
          asset: new StellarSDK.Asset(
            state.asset_code,
            Config.get("ASSET_ISSUER"),
          ),
        }),
      )
      .addMemo(memo)
      .setTimeout(30)
      .build();
    tx.sign(keypair);
    submitTransaction(tx, server);
  },
};

async function submitTransaction(tx, server) {
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
  return resp;
}
