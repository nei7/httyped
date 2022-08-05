import fetch from "node-fetch";
import { jsonSerializer } from "serializer";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "httyped.httyped",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No documents currently open");
        return;
      }

      if (!editor.document.fileName.endsWith(".ts")) {
        vscode.window.showErrorMessage("Only ts file supported");
        return;
      }

      const url = await vscode.window.showInputBox({
        placeHolder: "url",
        prompt: "specify the target url",
      });
      if (!url) {
        vscode.window.showErrorMessage("You need to specify url");
        return;
      }

      let httpMethod = await vscode.window.showQuickPick([
        "POST",
        "GET",
        "PUT",
        "PATCH",
        "HEAD",
        "TRACE",
        "DELETE",
      ]);
      if (!httpMethod) {
        httpMethod = "GET";
      }

      const interfaceName = await vscode.window.showInputBox({
        placeHolder: "interface name",
        prompt: "base interface name",
      });

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          cancellable: false,
          title: "Sending http request",
        },
        async (progress) => {
          progress.report({ increment: 0 });
          const response = await fetch(url, { method: httpMethod });
          progress.report({ increment: 100 });

          try {
            const json = await response.json();
            const ts = jsonSerializer(json, interfaceName);

            editor.edit((builder) => builder.insert(editor.selection.end, ts));
          } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
