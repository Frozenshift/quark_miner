import { sleep } from "../utils/utils.js";

import figlet from "figlet";
import chalk from "chalk";

const colors = [
  "red",
  "yellow",
  "green",
  "cyan",
  "blue",
  "magenta",
  "white",
  "redBright",
  "yellowBright",
  "greenBright",
  "cyanBright",
  "blueBright",
  "magentaBright",
  "whiteBright",
];

export const color = chalk.rgb(200, 162, 200);

export function displayAsciiTitle(titleText, secondaryTitle) {
  return new Promise((resolve, reject) => {
    figlet.text(
      titleText,
      {
        // font: "Swamp Land",
        horizontalLayout: "default",
        verticalLayout: "default",
        whitespaceBreak: true,
      },
      (err, data) => {
        if (err) {
          console.error("Error generating ASCII art:", err);
          reject(err);
          return;
        }
        if (!data) {
          resolve();
          return;
        }

        const terminalWidth = process.stdout.columns;
        const terminalHeight = process.stdout.rows;

        if (terminalWidth < 79) {
          resolve();
          return;
        }

        const paddingTop = Math.max(
          0,
          Math.floor((terminalHeight - data.split("\n").length) / 2),
        );
        const paddingSize = Math.max(
          0,
          Math.floor((terminalWidth - data.split("\n")[0].length) / 2),
        );
        const rightPaddingSize = Math.max(
          0,
          terminalWidth - data.split("\n")[0].length - paddingSize,
        );

        const centeredText = data
          .split("\n")
          .map(
            (line) =>
              " ".repeat(paddingSize) + line + " ".repeat(rightPaddingSize),
          )
          .join("\n");

        const finalText = "\n".repeat(paddingTop) + centeredText;

        let currentIndex = 0;

        const interval = setInterval(() => {
          const rainbowText = finalText
            .split("\n")
            .map((line, index) => {
              const colorIndex = (index + currentIndex) % colors.length;
              const color = colors[colorIndex];
              return chalk[color](line);
            })
            .join("\n");

          console.clear();
          console.log(color(rainbowText));

          if (secondaryTitle) {
            const secondaryPaddingSize = Math.max(
              0,
              Math.floor((terminalWidth - secondaryTitle.length) / 2),
            );
            const secondaryRightPaddingSize = Math.max(
              0,
              terminalWidth - secondaryTitle.length - secondaryPaddingSize,
            );
            const secondaryColorIndex =
              (currentIndex + secondaryPaddingSize) % colors.length;
            const secondaryColor = colors[secondaryColorIndex];
            const centeredSecondaryTitle =
              " ".repeat(secondaryPaddingSize) +
              chalk[secondaryColor](secondaryTitle) +
              " ".repeat(secondaryRightPaddingSize);
            console.log(centeredSecondaryTitle);
          }

          currentIndex = (currentIndex + 1) % colors.length;
        }, 150);

        setTimeout(() => {
          clearInterval(interval);
          console.clear();
          resolve();
        }, 2000);
      },
    );
  });
}

await displayAsciiTitle("Q U A R K", "t.me/quark-project");

export const logo = async (logger) => {
  await sleep(150);
  logger.info(` `);
  await sleep(150);
  logger.info(` #######   ##     ##     ###     ########   ##    ##`);
  await sleep(150);
  logger.info(`##     ##  ##     ##    ## ##    ##     ##  ##   ##`);
  await sleep(150);
  logger.info(`##     ##  ##     ##   ##   ##   ##     ##  ##  ##`);
  await sleep(150);
  logger.info(`##     ##  ##     ##  ##     ##  ########   #####`);
  await sleep(150);
  logger.info(`##  ## ##  ##     ##  #########  ##   ##    ##  ##`);
  await sleep(150);
  logger.info(`##    ##   ##     ##  ##     ##  ##    ##   ##   ##`);
  await sleep(150);
  logger.info(` ##### ##   #######   ##     ##  ##     ##  ##    ##`);
  await sleep(150);
  logger.info(` `);
};
