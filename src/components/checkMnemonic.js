import { logger } from "../logger.js";
import { mnemonicToWalletKey } from "@ton/crypto";

export const checkMnemonic = async (mnemonic) => {
  if (!mnemonic) {
    logger.error("Mnemonic not found");
    process.exit(1);
  }
  const notVerifiedMnemonic = mnemonic.split(" ");
  if (notVerifiedMnemonic.length !== 24) {
    logger.error(`Mnemonic cannot be ${notVerifiedMnemonic.length} words!`);
    logger.info(`Edit your mnemonic in config.txt`);
    process.exit(1);
  }
  return await mnemonicToWalletKey(notVerifiedMnemonic);
};
