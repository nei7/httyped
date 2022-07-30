import debug from "debug";
import fetch from "node-fetch";
import jsonSerializer from "../jsonSerializer";
import { GenerateOptions } from "../types";

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
    const result = jsonSerializer(["123", 34, true, {}], "QuizizzResponse");

    console.log(result);
  }

  return 0;
}
