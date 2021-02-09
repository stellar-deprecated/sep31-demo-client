module.exports = {
  instruction: "POST relevent field info to create a new payment",
  action: "POST /transactions (SEP-0031)",
  execute: async function(state, { request, response, instruction, expect }) {
    const send_server = state.send_server;
    const body = {
      sender_id: state.sender_sep12_id,
      receiver_id: state.receiver_sep12_id,
      fields: { transaction: state.all_field_values.transaction },
      asset_code: state.asset_code,
      amount: state.all_field_values.amount.amount,
    };
    request("POST /transactions", body);
    const resp = await fetch(`${send_server}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    expect(
      [200, 201].includes(resp.status),
      `POST /transactions responded with status ${resp.status}`,
    );
    const result = await resp.json();
    response("POST /transactions", result);
    ["id", "stellar_account_id", "stellar_memo_type", "stellar_memo"].forEach(
      (key) => {
        expect(
          result[key],
          `POST /transactions response missing property ${key}`,
        );
      },
    );
    state.send_memo_type = result["stellar_memo_type"];
    state.send_memo = result["stellar_memo"];
    state.receiver_address = result["stellar_account_id"];
    state.transaction_id = result["id"];
  },
};
