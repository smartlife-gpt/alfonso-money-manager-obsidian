import type AlfonsoPlugin from "@/main";
import { QueryBuilderModal } from "@/modals/QueryBuilderModal";
import { MarkdownView, type Editor, type EditorPosition, App } from "obsidian";

export default class QueryBuilderModalCommand {
  static register(plugin: AlfonsoPlugin) {
    plugin.addCommand({
      id: "xxx-id",
      name: "Query Builder Window",
      callback: () => {
        const myModal = new QueryBuilderModal(plugin.app, plugin);
        const editor =
          plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        let humanQuery = "";
        if (editor) {
          const cursor = editor.getCursor();
          humanQuery = this.extractCodeBlock(editor, cursor, plugin.app) ?? "";
        }

        myModal.open(humanQuery);
      },
    });
  }

  static extractCodeBlock(
    editor: Editor,
    cursor: EditorPosition,
    app: App
  ): string | null {
    // Check if we are in editing mode
    const activeView = app.workspace.getActiveViewOfType(MarkdownView);
    if (
      !activeView ||
      !activeView.getMode() ||
      activeView.getMode() !== "source"
    ) {
      return null; // Not in editing mode or not a markdown view
    }

    // Get the entire document's content
    const docContent = editor.getValue();
    const cursorOffset = editor.posToOffset(cursor);
    const contentBeforeCursor = docContent.substring(0, cursorOffset);
    const contentAfterCursor = docContent.substring(cursorOffset);

    // Find the nearest code block start before the cursor
    const startCodeBlock = contentBeforeCursor.lastIndexOf("```alfonso");
    if (startCodeBlock === -1) {
      return null; // No start code block found
    }

    // Find the end of the code block after the cursor
    const endCodeBlock = contentAfterCursor.indexOf("```");
    if (endCodeBlock === -1) {
      return null; // No end code block found
    }

    // Extract and return the code block content
    const codeBlockContent =
      contentBeforeCursor.substring(startCodeBlock) +
      contentAfterCursor.substring(0, endCodeBlock);

    return codeBlockContent.replace("```alfonso", "").replace("```", "");
  }
}
