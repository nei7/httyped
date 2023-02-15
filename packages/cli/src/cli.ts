import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { generate } from "./generate";
import { GenerateOptions } from "./types";
import { HttpMethod } from "./types";
import consola from "consola";
import inquirer, { QuestionCollection } from "inquirer";
import figlet from "figlet";
import chalk from "chalk";

const httpMethods: HttpMethod[] = [
  "POST",
  "GET",
  "PUT",
  "PATCH",
  "HEAD",
  "TRACE",
  "DELETE",
];

function options(args: Argv<{}>) {
  return args
    .option("url", {
      alias: "u",
      type: "string",
      describe: "Specify the target url",
    })
    .option("method", {
      alias: "m",
      type: "string",
      describe: "Http method",
      choices: httpMethods,
    })
    .option("file", {
      alias: "f",
      type: "string",
      describe: "Output file",
    })
    .option("body", {
      alias: "b",
      type: "string",
    });
}

process.on("unhandledRejection", (err) =>
  consola.error("[unhandledRejection]", err)
);

process.on("uncaughtException", (err) =>
  consola.error("[uncaughtException]", err)
);

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
      console.log(chalk.blueBright(figlet.textSync("httyped")), "\n");

      const questions: QuestionCollection = {
        url: {
          message: "Specify target url",
        },
        method: {
          message: "Choose http method",
          type: "list",
          choices: httpMethods,
        },
        file: {
          message: "Enter output file name",
          type: "input",
        },
      };

      try {
        const answers = await inquirer.prompt(
          ["url", "method", "file"]
            .filter((arg) => !argv[arg])
            // @ts-ignore
            .map((name) => ({ name, ...questions[name] }))
        );

        await generate({ ...answers, ...argv } as GenerateOptions);
      } catch (err) {
        consola.error(err);
      }
    }
  )
  .parse();
