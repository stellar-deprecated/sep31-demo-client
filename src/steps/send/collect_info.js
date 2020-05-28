const Config = require("src/config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction:
    "To collect the required information we show a form with all the requested fields from /info",
  action: "Show field collection form",
  execute: async function(state, { response, setDevicePage }) {
    setDevicePage(
      "pages/collect-fields.html?fields=" + JSON.stringify(state.fields),
    );

    await new Promise((resolve, reject) => {
      const cb = (e) => {
        state.field_values = e.data;
        response("Collected the following fields", e.data);
        window.removeEventListener("message", cb);
        resolve();
      };
      window.addEventListener("message", cb);
    });
  },
};
