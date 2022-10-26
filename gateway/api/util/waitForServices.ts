import fetch from "node-fetch";

interface Service {
  name: string;
  url: string;
}

const sleep = (time: number) => new Promise((r) => setTimeout(r, time));

export default async function waitForServices(services: Service[]) {
  while (true) {
    const results: string[] = await Promise.all(
      services.map((s) =>
        fetch(s.url)
          .then(() => "ok")
          .catch((err) => err.message)
      )
    );
    console.log("results " + results);
    const errors = results.filter((res) => res.includes("ECONNREFUSED"));
    if (errors.length) {
      console.log("waiting for services avaliability");
      await sleep(1000);
    } else {
      return true;
    }
  }
}
