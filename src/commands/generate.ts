import debug from "debug";
import fetch from "node-fetch";
import jsonSerializer from "../jsonSerializer";
import { GenerateOptions } from "../types";
import { capitalize } from "../utils";
import fs from "fs";

const _debug = debug("httyped:generate");

export async function generate(options: GenerateOptions): Promise<number> {
  if (!options.file.endsWith(".ts")) {
    console.error("invalid file type");
    return 1;
  }

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

    fs.appendFileSync(options.file, result);
  }

  return 0;
}

function getInterfaceNameFromUrl(url: string): string {
  const endIndex = url.lastIndexOf("?");
  const lastParam = url.substring(
    url.lastIndexOf("/") + 1,
    endIndex === -1 ? undefined : endIndex
  );
  return capitalize(lastParam) + "Response";
}
