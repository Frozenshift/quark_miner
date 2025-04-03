import { sleep } from "../utils/utils.js";

export async function CallForSuccess(toCall, attempts = 20, delayMs = 100) {
  if (typeof toCall !== "function") {
    throw new Error("unknown input");
  }

  let i = 0;
  let lastError;

  while (i < attempts) {
    try {
      const res = await toCall();
      return res;
    } catch (err) {
      lastError = err;
      i++;
      await sleep(delayMs);
    }
  }

  console.log("error after attempts", i);
  throw lastError;
}
