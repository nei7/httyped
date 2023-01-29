import { appendFile } from "fs/promises";
import fetch from "node-fetch";
import consola from "consola";
import { join } from "path";
import { parse } from "@httyped/core";
import { GenerateOptions } from "../types";
import chalk from "chalk";
import ora from "ora";

export async function generate(params: GenerateOptions): Promise<number> {
  if (!params.file.endsWith(".ts")) {
    consola.error("invalid file type");
    return 1;
  }

  const spinner = ora({
    text: "Sending http request to: " + chalk.blueBright(params.url),
  });

  spinner.start();

  const body = getBody(params.body);
  const response = await fetch(params.url, {
    headers: {
      "Content-type": body ? "application/json" : "text/html",
    },
    method: params.method,
    body,
  });

  spinner.clear();

  if (!response.ok) {
    consola.error(
      "Request to",
      chalk.underline.blueBright(params.url),
      "failed."
    );

    return 1;
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
  }

  return 0;
}

function getBody(body?: string) {
  if (!body) {
    return undefined;
  }

  try {
    return JSON.parse(body) && JSON.stringify(body);
  } catch (err) {
    return body;
  }
}
