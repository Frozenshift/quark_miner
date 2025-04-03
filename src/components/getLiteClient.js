import { httpRequest } from "../utils/httpRequestService.js";
import {
  LiteClient,
  LiteRoundRobinEngine,
  LiteSingleEngine,
} from "ton-lite-client";

let lc = undefined;
let createLiteClient;

function intToIP(int) {
  const part1 = int & 255;
  const part2 = (int >> 8) & 255;
  const part3 = (int >> 16) & 255;
  const part4 = (int >> 24) & 255;

  return `${part4}.${part3}.${part2}.${part1}`;
}

export async function getLiteClient(_configUrl) {
  if (lc) {
    return lc;
  }

  if (!createLiteClient) {
    createLiteClient = (async () => {
      const res = await httpRequest(_configUrl);
      const liteServers = res.liteservers;
      const engines = [];
      for (const server of liteServers) {
        const ls = server;
        engines.push(
          new LiteSingleEngine({
            host: `tcp://${intToIP(ls.ip)}:${ls.port}`,
            publicKey: Buffer.from(ls.id.key, "base64"),
          }),
        );
      }
      const engine = new LiteRoundRobinEngine(engines);
      lc = new LiteClient({
        engine,
        batchSize: 1,
      });
    })();
  }

  await createLiteClient;

  return lc;
}
