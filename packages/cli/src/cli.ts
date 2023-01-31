import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { generate } from "./generate";
import { GenerateOptions } from "./types";
import { HttpMethod } from "./types";
import consola from "consola";
import inquirer, { QuestionCollection } from "inquirer";
import figlet from "figlet";

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
      const questions: QuestionCollection = {
        url: {
          message: "Specify target url",
          validate: (input) => {
            return /A-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi.test(
              input
            );
          },
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

        console.log(answers, argv);

        await generate(argv as GenerateOptions);
      } catch (err) {
        consola.error(err);
      }
    }
  )
  .parse();
