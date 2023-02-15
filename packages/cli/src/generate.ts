import { appendFile } from "fs/promises";
import consola from "consola";
import { join } from "path";
import { parse } from "@httyped/core";
import { GenerateOptions } from "./types";
import chalk from "chalk";
import ora from "ora";
import { makeRequest } from "./request";

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

  try {
    const response = await makeRequest(params.url, {
      body: params.body,
      method: params.method,
    });

    if (!response.ok) {
      consola.error(
        "Request to",
        chalk.underline.blueBright(params.url),
        "failed."
      );

      process.exit(1);
    }

    const contentType =
      response.headers.get("Content-type") ||
      response.headers.get("content-type");

    if (
      /application\/(ld\+)?json/.test(contentType?.toLocaleLowerCase() || "")
    ) {
      const result = parse(await response.text());

      const path = join(process.cwd(), params.file);
      await appendFile(path, result);

      consola.success(
        `🪄  Your types have been generated in ${chalk.underline.blueBright(
          path
        )}`
      );
    } else {
      consola.error("Can't create typescript types from given url");
    }
  } catch (err) {
    spinner.clear();

    consola.error(err.message);

    process.exit(1);
  } finally {
    spinner.clear();
  }
}
