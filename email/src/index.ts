import messageBroker from "./messageBroker";

async function main() {
  await messageBroker.init();
  Object.freeze(messageBroker); //singleton instance
  messageBroker.consumeMessages(["mail.#"]);
}

main().catch((err) => console.log(err));
