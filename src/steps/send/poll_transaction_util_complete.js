module.exports = {
  instruction:
    "Poll /transaction endpoint until transaction status reaches end status",
  action: "GET /transaction (SEP-0031)",
  execute: async function(state, { request, response, instruction, expect }) {
    const send_server = state.send_server;
    const params = { id: state.transaction_id };
    let transactionStatus;
    while (
      !["pending_external", "completed", "error"].includes(transactionStatus)
    ) {
      request("GET /transaction", params);
      const resp = await fetch(
        `${send_server}/transaction?` + new URLSearchParams(params).toString(),
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        },
      );
      expect(
        resp.status === 200,
        `GET /transaction responded with status ${resp.status}`,
      );
      let result = await resp.json();
      response("GET /transaction", result);
      transactionStatus = result.transaction.status;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  },
};
