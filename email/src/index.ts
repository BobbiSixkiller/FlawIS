import messageBroker from "./messageBroker";

async function main() {
  await messageBroker.init();
  Object.freeze(messageBroker); //singleton instance
  messageBroker.consumeMessages(["user.new"]);
}

main().catch((err) => console.log(err));
