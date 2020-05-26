const Config = require("src/config");
const get = require("src/util/get");
const prop = require("lodash.get");

module.exports = {
  instruction: "Check /info endpoint to see if we need to authenticate",
  action: "GET /info (SEP-0006)",
  execute: async function(state, { request, response, instruction, expect }) {
    const send_server = state.send_server;
    request("GET /info");
    const result = await get(`${send_server}/info`);
    response("GET /info", result);
    expect(result.send, "/info response needs a `send` property");
    state.asset_code = Object.keys(result.send)[0];
    expect(state.asset_code, "There is no assets enabled in the send section");
    expect(
      prop(result, ["send", state.asset_code, "enabled"]),
      `${state.asset_code} is not enabled for deposit`,
    );
    expect(
      prop(result, ["send", state.asset_code, "fields"]),
      "No `fields` object specified in /info",
    );
    expect(
      prop(result, ["send", state.asset_code, "fields", "sender"]),
      "No sender fields specified",
    );
    expect(
      prop(result, ["send", state.asset_code, "fields", "receiver"]),
      "No receiver fields specified",
    );
    expect(
      prop(result, ["send", state.asset_code, "fields", "transaction"]),
      "No transaction fields specified",
    );
    state.fields = result.send[state.asset_code].fields;

    instruction("Send is enabled for asset " + state.asset_code);
  },
};
