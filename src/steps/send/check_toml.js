const Config = require("src/config");
const toml = require("toml");

module.exports = {
  instruction:
    "Check the stellar.toml to find the necessary information about the receivers payment server",
  action: "GET /.well-known/stellar.toml (SEP-0001)",
  execute: async function(state, { request, response, instruction, expect }) {
    let HOME_DOMAIN = Config.get("HOME_DOMAIN");
    expect(HOME_DOMAIN, "Config needs a HOME_DOMAIN set");

    if (HOME_DOMAIN.indexOf("http") != 0) {
      HOME_DOMAIN = "https://" + HOME_DOMAIN;
    }
    HOME_DOMAIN = HOME_DOMAIN.replace(/\/$/, "");
    request(`${HOME_DOMAIN}/.well-known/stellar.toml`);
    const resp = await fetch(`${HOME_DOMAIN}/.well-known/stellar.toml`);
    const text = await resp.text();
    try {
      const information = toml.parse(text);
      response(`${HOME_DOMAIN}/.well-known/stellar.toml`, information);
      expect(
        information.WEB_AUTH_ENDPOINT,
        "Toml file doesn't contain a WEB_AUTH_ENDPOINT",
      );
      state.auth_endpoint = information.WEB_AUTH_ENDPOINT;
      state.send_server = information.DIRECT_PAYMENT_SERVER;
      state.kyc_server = information.KYC_SERVER;
    } catch (e) {
      console.error(e);
      response(`${HOME_DOMAIN}/.well-known/stellar.toml`, text);
      expect(false, "stellar.toml is not a valid SEP31 TOML file");
    }

    instruction("Received WEB_AUTH_ENDPOINT from TOML: " + state.auth_endpoint);
    instruction(
      "Received DIRECT_PAYMENT_SERVER from TOML: " + state.send_server,
    );

    if (state.send_server)
      state.send_server = state.send_server.replace(/\/$/, "");
    if (state.auth_endpoint)
      state.auth_endpoint = state.auth_endpoint.replace(/\/$/, "");
    if (Config.get("PUBNET")) {
      expect(
        state.send_server && state.send_server.indexOf("https://") === 0,
        "DIRECT_PAYMENT_SERVER must be https",
      );
      expect(
        state.auth_endpoint && state.auth_endpoint.indexOf("https://") === 0,
        "WEB_AUTH_ENDPOINT must be https",
      );
    }
  },
};
