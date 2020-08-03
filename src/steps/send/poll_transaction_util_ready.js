module.exports = {
  instruction:
    "Poll /transactions/:id endpoint until transaction status is 'pending_sender'",
  action: "GET /transactions/:id (SEP-0031)",
  execute: async function(state, { request, response, instruction, expect }) {
    const send_server = state.send_server;
    const id = state.transaction_id;
    let transactionStatus;
    while (transactionStatus !== "pending_sender") {
      request(`GET /transactions/${id}`);
      const resp = await fetch(`${send_server}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      expect(
        resp.status === 200,
        `GET /transactions/${id} responded with status ${resp.status}`,
      );
      let result = await resp.json();
      response(`GET /transactions/${id}`, result);
      transactionStatus = result.transaction.status;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  },
};
