const Config = require("src/config");
const get = require("src/util/get");
const prop = require("lodash.get");

module.exports = {
  instruction: "Check /info endpoint to see if we need to authenticate",
  action: "GET /info (SEP-0031)",
  execute: async function(state, { request, response, instruction, expect }) {
    const send_server = state.send_server;
    request("GET /info");
    const result = await get(`${send_server}/info`);
    response("GET /info", result);
    expect(result.receive, "/info response needs a `receive` property");
    state.asset_code = Config.get("ASSET_CODE");
    expect(
      state.asset_code,
      `Could not find asset code ${Config.get("ASSET_CODE")} in /info response`,
    );
    expect(
      prop(result, ["receive", state.asset_code, "enabled"]),
      `${state.asset_code} is not enabled for deposit`,
    );
    expect(
      prop(result, ["receive", state.asset_code, "fields"]),
      "No `fields` object specified in /info",
    );
    expect(
      prop(result, ["receive", state.asset_code, "fields", "transaction"]),
      "No transaction fields specified",
    );
    state.fields = result.receive[state.asset_code].fields;
    state.sender_sep12_type =
      result.receive[state.asset_code].sender_sep12_type;
    state.receiver_sep12_type =
      result.receive[state.asset_code].receiver_sep12_type;

    instruction("Send is enabled for asset " + state.asset_code);
    response(
      "The receiving anchor requires the following fields",
      state.fields,
    );
  },
};
