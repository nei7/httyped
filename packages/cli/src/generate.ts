import { appendFile } from "fs/promises";
import fetch from "node-fetch";
import consola from "consola";
import { join } from "path";
import { parse } from "@httyped/core";
import { GenerateOptions } from "./types";
import chalk from "chalk";
import ora from "ora";

export async function generate(params: GenerateOptions) {
  if (!params.file.endsWith(".ts")) {
    consola.error(
      "Please provide valid output file extension",
      chalk.bold.blueBright("(.ts)")
    );

    process.exit(1);
  }

  const spinner = ora({
    text: "Sending http request to: " + chalk.blueBright(params.url),
  });

  spinner.start();

  const response = await fetch(params.url, {
    headers: {
      "Content-type": params.body ? "application/json" : "text/html",
    },
    method: params.method,
    body: JSON.stringify(params.body),
  });

  spinner.clear();

  if (!response.ok) {
    consola.error(
      "Request to",
      chalk.underline.blueBright(params.url),
      "failed."
    );

    process.exit(1);
  }

  const contentType = response.headers.get("Content-type");
  if (
    contentType &&
    contentType.toLocaleLowerCase().includes("application/json")
  ) {
    try {
      const json = await response.text();

      const result = parse(json);

      await appendFile(params.file, result);

      const path = join(process.cwd(), params.file);

      consola.success(
        `🪄  Your types have been generated in ${chalk.underline.blueBright(
          path
        )}`
      );
    } catch (err) {
      consola.error(err);
    }
  } else {
    consola.error("Can't create typescript types from given url");
  }
}
