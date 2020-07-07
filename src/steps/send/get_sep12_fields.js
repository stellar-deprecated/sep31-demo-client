const Config = require("src/config");
const get = require("src/util/get");
const crypto = require("crypto");
const StellarSDK = require("stellar-sdk");

module.exports = {
  instruction: "Make GET /customer requests for sending and receiving user",
  action: "GET /customer (SEP-0012)",
  execute: async function(state, { request, response, instruction, expect }) {
    if (state.sender_sep12_type) {
      state.sender_sep12_memo = crypto.randomBytes(32).toString("base64");
      state.sender_sep12_fields = await collectSEP12Fields(
        state.sender_sep12_type,
        state.sender_sep12_memo,
        request,
        response,
        state,
        expect,
      );
    }
    if (state.receiver_sep12_type) {
      state.receiver_sep12_memo = crypto.randomBytes(32).toString("base64");
      state.receiver_sep12_fields = await collectSEP12Fields(
        state.receiver_sep12_type,
        state.receiver_sep12_memo,
        request,
        response,
        state,
        expect,
      );
    }
  },
};

async function collectSEP12Fields(
  type,
  memo,
  request,
  response,
  state,
  expect,
) {
  const publicKey = StellarSDK.Keypair.fromSecret(
    Config.get("SENDER_SK"),
  ).publicKey();
  // The anchor needs a memo to disambiguate the sending and receiving clients
  // since the wallet uses the same 'account' for both.
  const params = {
    type: type,
    account: publicKey,
    memo: memo,
    memo_type: "hash",
  };
  request("GET /customer", params);
  const result = await get(`${state.kyc_server}/customer?`, params, {
    headers: {
      Authorization: `Bearer ${state.token}`,
    },
  });
  response("GET /customer", result);
  expect(
    result.status === "NEEDS_INFO",
    "Unexpected status for new customer: " + result.status,
  );
  return result.fields;
}
