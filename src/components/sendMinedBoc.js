import { getLiteClient } from "./getLiteClient.js";
import { internal, toNano } from "@ton/core";

export async function sendMinedBoc(wallet, seqno, keyPair, giverAddress, boc) {
  const wallets = [];
  // const ton4Client = await getTon4Client();
  // const tonOrbsClient = await getTon4ClientOrbs();
  // const w2 = ton4Client.open(wallet);
  // const w3 = tonOrbsClient.open(wallet);
  // wallets.push(w2);
  // wallets.push(w3);

  const liteServerClient = await getLiteClient(
    "https://ton-blockchain.github.io/global.config.json",
  );
  const w1 = liteServerClient.open(wallet);
  wallets.push(w1);
  for (let i = 0; i < 3; i++) {
    for (const w of wallets) {
      w.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
          internal({
            to: giverAddress,
            value: toNano("0.07"),
            bounce: true,
            body: boc,
          }),
        ],
        sendMode: 3,
      }).catch((e) => {
        //
      });
    }
  }
}
