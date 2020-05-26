const Config = require("src/config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction:
    "To collect the interactive information we launch the interactive URL in a frame or webview, and await payment details from a postMessage callback",
  action: "Launch interactive portion",
  execute: async function(
    state,
    {
      response,
      waitForPageMessage,
      action,
      instruction,
      expect,
      setDevicePage,
    },
  ) {
    const message = setDevicePage(
      "pages/collect-fields.html?fields=" + JSON.stringify(state.fields),
    );

    await new Promise((resolve, reject) => {
      console.log("Listening to messages");
      window.addEventListener("message", (e) => {
        console.log("message", e);
        state.field_values = e.data;
        resolve();
      });
    });
  },
};
