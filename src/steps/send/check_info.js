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
    asset_info = result.receive[state.asset_code];
    state.fields = asset_info.fields;
    if (asset_info.sep12) {
      if (asset_info.sep12.sender.types) {
        let sender_types = Object.keys(asset_info.sep12.sender.types);
        state.sender_sep12_type = sender_types[0];
        instruction(
          `Found the following customer types for senders: ${sender_types.join(
            ", ",
          )}`,
        );
        instruction(
          `Using ${sender_types[0]}: ${
            asset_info.sep12.sender.types[sender_types[0]].description
          }`,
        );
      } else {
        instruction("The anchor does not require KYC for sending customers");
      }
      if (asset_info.sep12.receiver.types) {
        let receiver_types = Object.keys(asset_info.sep12.receiver.types);
        state.receiver_sep12_type = receiver_types[0];
        instruction(
          `Found the following customer types for receivers: ${receiver_types.join(
            ", ",
          )}`,
        );
        instruction(
          `Using ${receiver_types[0]}: ${
            asset_info.sep12.receiver.types[receiver_types[0]].description
          }`,
        );
      } else {
        instruction("The anchor does not require KYC for receiving customers");
      }
    } else {
      if (asset_info.sender_sep12_type) {
        state.sender_sep12_type = asset_info.sender_sep12_type;
        instruction(
          `Using ${state.sender_sep12_type} type for sending customer`,
        );
      } else {
        instruction("The anchor does not require KYC for sending customers");
      }
      if (asset_info.receiver_sep12_type) {
        state.receiver_sep12_type = asset_info.receiver_sep12_type;
        instruction(
          `Using ${state.receiver_sep12_type} type for receiving customer`,
        );
      } else {
        instruction("The anchor does not require KYC for receiving customers");
      }
    }

    instruction("Send is enabled for asset " + state.asset_code);
    response(
      "The receiving anchor requires the following transaction fields",
      state.fields,
    );
  },
};
