import "./wallet.scss";
import "./collect-fields.scss";
const params = new URLSearchParams(window.location.search);
const fields = JSON.parse(params.get("fields"));
["sender", "receiver", "transaction"].forEach((section) => {
  const container = document.querySelector(`#${section}-fields`);
  for (let [key, value] of Object.entries(fields[section])) {
    const div = document.createElement("div");
    div.className = "field-container";
    const label = document.createElement("label");
    label.textContent = value.description;
    div.appendChild(label);
    const field = document.createElement("input");
    field.type = "text";
    field.className = "field";
    field.placeholder = key;
    field.name = `${section}#${key}`;
    div.appendChild(field);
    container.appendChild(div);
  }
});

document.querySelector("#submit").addEventListener("click", () => {
  const fields = document.querySelectorAll("input.field");
  const values = {
    sender: {},
    receiver: {},
    transaction: {},
  };
  fields.forEach((field) => {
    const [section, fieldName] = field.name.split("#");
    values[section][fieldName] = field.value;
  });
  window.parent.postMessage(values, "*");
});
