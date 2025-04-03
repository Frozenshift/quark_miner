import { Cell, parseTuple, TupleReader } from "@ton/core";

export async function getPowInfo(liteClient, address) {
  const lastInfo = await liteClient.getMasterchainInfo();
  const powInfo = await liteClient.runMethod(
    address,
    "get_pow_params",
    Buffer.from([]),
    lastInfo.last,
  );
  const powStack = Cell.fromBase64(powInfo.result);
  const stack = parseTuple(powStack);

  const reader = new TupleReader(stack);
  const seed = reader.readBigNumber();
  const complexity = reader.readBigNumber();
  const iterations = reader.readBigNumber();

  return [seed, complexity, iterations];
}
