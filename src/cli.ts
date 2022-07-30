import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { generate } from "./commands/generate";
import { GenerateOptions } from "./types";
import { HttpMethod } from "./types";

function options(args: Argv<{}>) {
  return args
    .option("url", {
      alias: "u",
      type: "string",
      describe: "specify the target url",
      demandOption: true,
    })
    .option("method", {
      alias: "m",
      type: "string",
      describe: "http method",
      demandOption: true,
      choices: [
        "POST",
        "GET",
        "PUT",
        "PATCH",
        "HEAD",
        "TRACE",
        "DELETE",
      ] as HttpMethod[],
    })
    .option("file", {
      alias: "f",
      type: "string",
      describe: "output file",
      demandOption: true,
    });
}

yargs(hideBin(process.argv))
  .scriptName("httyped")
  .usage("$0 [args]")
  .command(
    "*",
    "generate types",
    (args) => {
      return options(args);
    },
    async (argv) => {
      const status = await generate(argv as GenerateOptions);
      process.exit(status);
    }
  )

  .parse();
