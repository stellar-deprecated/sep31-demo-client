const Config = require("src/config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction:
    "To collect the required information we show a form with all the requested fields from /info",
  action: "Show field collection form",
  execute: async function(state, { response, setDevicePage }) {
    const allFields = {
      transaction: state.fields.transaction,
      sender: state.sender_sep12_fields,
      receiver: state.receiver_sep12_fields,
    };
    setDevicePage(
      "pages/collect-fields.html?fields=" + JSON.stringify(allFields),
    );
    await new Promise((resolve, reject) => {
      const cb = (e) => {
        state.all_field_values = e.data;
        response("Collected the following fields", e.data);
        window.removeEventListener("message", cb);
        resolve();
      };
      window.addEventListener("message", cb);
    });
  },
};
