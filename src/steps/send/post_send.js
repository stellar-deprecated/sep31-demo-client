module.exports = {
  instruction: "POST relevent field info to create a new payment",
  action: "POST /send (SEP-0031)",
  execute: async function(state, { request, response, instruction, expect }) {
    const send_server = state.send_server;
    request("POST /send");
    const body = {
      fields: JSON.stringify(state.field_values, null, 2),
      amount: 100,
    };
    const resp = await fetch(`${send_server}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify(body, null, 2),
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
  },
};
