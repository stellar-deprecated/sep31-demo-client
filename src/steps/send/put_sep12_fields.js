const Config = require("src/config");
const StellarSDK = require("stellar-sdk");

module.exports = {
  instruction: "Make PUT /customer requests for sending and receiving user",
  action: "PUT /customer (SEP-0012)",
  execute: async function(state, { request, response, instruction, expect }) {
    if (state.sender_sep12_fields) {
      let responseJSON = await putSEP12Fields(
        state.all_field_values.sender,
        state.sender_sep12_memo,
        state,
        request,
        response,
        expect,
      );
      state.sender_sep12_id = responseJSON.id;
    }
    if (state.receiver_sep12_fields) {
      let responseJSON = await putSEP12Fields(
        state.all_field_values.receiver,
        state.receiver_sep12_memo,
        state,
        request,
        response,
        expect,
      );
      state.receiver_sep12_id = responseJSON.id;
    }
  },
};

async function putSEP12Fields(fields, memo, state, request, response, expect) {
  const publicKey = StellarSDK.Keypair.fromSecret(
    Config.get("SENDER_SK"),
  ).publicKey();
  const dataObj = {
    account: publicKey,
    memo_type: "hash",
    memo: memo,
  };
  for (key in fields) {
    dataObj[key] = fields[key];
  }
  request("PUT /customer", dataObj);
  const data = new FormData();
  for (key in dataObj) {
    data.append(key, dataObj[key]);
  }
  const responseObj = await fetch(state.kyc_server + "/customer", {
    headers: {
      Authorization: `Bearer ${state.token}`,
    },
    method: "PUT",
    body: data,
  });
  const json = await responseObj.json();
  response("PUT /customer", json);
  expect(
    responseObj.status === 202,
    "Unexpected status for PUT /customer request: " + responseObj.status,
  );
  return json;
}
