import { httpRequest } from "../utils/httpRequestService.js";
import { logger } from "../logger.js";

export const getUserGivers = async (UUID) => {
  try {
    const givers = await httpRequest(
      `https://api.quark-project.ru/get_my_givers/${UUID}`,
    );
    if (givers !== null && givers.success && givers.data.length > 0) {
      logger.info(`Successfully getting ${givers.data.length} givers...`);
      return givers;
    } else {
      logger.error(`Givers not found check UUID`);
      process.exit(1);
    }
  } catch (e) {
    console.log(e);
    logger.error(`Givers not found.`);
    return null;
  }
};
