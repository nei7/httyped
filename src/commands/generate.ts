import { appendFile } from "fs/promises";
import fetch from "node-fetch";
import consola from "consola";
import { join } from "path";
import jsonSerializer, { pascalCase } from "../jsonSerializer";
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

  const response = await fetch(options.url, {
    method: options.method,
  });

  const contentType = response.headers.get("Content-type");
  if (
    contentType &&
    contentType.toLocaleLowerCase().includes("application/json")
  ) {
    const json = await response.json();
    const result = jsonSerializer(
      json,
      options.typeName ?? getInterfaceNameFromUrl(response.url)
    );

    await appendFile(options.file, result);

    const path = join(process.cwd(), options.file);

    spinner.clear();

    consola.success(
      `🪄  Your types have been generated in ${chalk.blueBright(path)}`
    );
  }

  return 0;
}

function getInterfaceNameFromUrl(url: string): string {
  const endIndex = url.lastIndexOf("?");
  const lastParam = url.substring(
    url.lastIndexOf("/") + 1,
    endIndex === -1 ? undefined : endIndex
  );
  return pascalCase(lastParam) + "Response";
}
