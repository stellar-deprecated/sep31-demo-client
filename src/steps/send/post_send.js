module.exports = {
  instruction: "POST relevent field info to create a new payment",
  action: "POST /send (SEP-0031)",
  execute: async function(state, { request, response, instruction, expect }) {
    const send_server = state.send_server;
    const body = {
      fields: state.field_values,
      asset_code: state.asset_code,
      amount: 100,
    };
    request("POST /send", body);
    const resp = await fetch(`${send_server}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    expect(
      resp.status === 200,
      `POST /send responded with status ${resp.status}`,
    );
    const result = await resp.json();
    response("POST /send", result);
    ["id", "stellar_account_id", "stellar_memo_type", "stellar_memo"].forEach(
      (key) => {
        expect(result[key], `POST /send response missing property ${key}`);
      },
    );
    state.send_memo_type = result["stellar_memo_type"];
    state.send_memo = result["stellar_memo"];
    state.receiver_address = result["stellar_account_id"];
    state.transaction_id = result["id"];
  },
};
