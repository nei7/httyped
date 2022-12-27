import { appendFile } from "fs/promises";
import fetch from "node-fetch";
import consola from "consola";
import { join } from "path";
import { parse } from "@httyped/core";
import { GenerateOptions } from "../types";
import chalk from "chalk";
import ora from "ora";

export async function generate(options: GenerateOptions): Promise<number> {
  if (!options.file.endsWith(".ts")) {
    consola.error("invalid file type");
    return 1;
  }

  const spinner = ora({
    text: "Sending http request to: " + chalk.blueBright(options.url),
  });

  spinner.start();

  const body = getBody(options.body);
  const response = await fetch(options.url, {
    headers: {
      "Content-type": body ? "application/json" : "text/html",
    },
    method: options.method,
    body,
  });
  spinner.clear();

  const contentType = response.headers.get("Content-type");
  if (
    contentType &&
    contentType.toLocaleLowerCase().includes("application/json")
  ) {
    const json = await response.text();
    const result = parse(json);

    await appendFile(options.file, result);

    const path = join(process.cwd(), options.file);

    consola.success(
      `🪄  Your types have been generated in ${chalk.blueBright(path)}`
    );
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
