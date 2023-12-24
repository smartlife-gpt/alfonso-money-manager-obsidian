import QueryBuilderModalVue from "@/ui/modals/QueryBuilderModal.vue";
import { App, MarkdownView, Modal, Plugin } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import { CategorySelectModal } from "./CategorySelectModal";
import { EventSelectModal } from "./EventSelectModal";

export class QueryBuilderModal extends Modal {
  _vueApp: VueApp | undefined;
  plugin: Plugin;

  categorySelectModal: CategorySelectModal;
  eventSelectModal: EventSelectModal;

  humanQuery: string = "";

  constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
    this.categorySelectModal = new CategorySelectModal(app, plugin);
    this.eventSelectModal = new EventSelectModal(app, plugin);
  }

  open(humanQyery: string = "") {
    this.humanQuery = humanQyery;
    super.open();
  }

  close(humanQuery: string = "") {
    super.close();

    if (!humanQuery || humanQuery.length == 0) return;

    //Paste humanQuery to editor at cursor position
    const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (editor) {
      const cursor = editor.getCursor();
      const cursorOffset = editor.posToOffset(cursor);
      const docContent = editor.getValue();
      const contentBeforeCursor = docContent.substring(0, cursorOffset);
      const contentAfterCursor = docContent.substring(cursorOffset);

      const startCodeBlock = contentBeforeCursor.lastIndexOf("```alfonso");
      const endCodeBlockToStartCodeBlock =
        contentBeforeCursor.lastIndexOf("```");

      if (
        startCodeBlock === -1 ||
        endCodeBlockToStartCodeBlock > startCodeBlock
      ) {
        editor.replaceRange("```alfonso\n" + humanQuery + "\n```", cursor);
        editor.setCursor(editor.offsetToPos(cursorOffset));
        return;
      }

      const endCodeBlock = contentAfterCursor.indexOf("```");

      if (endCodeBlock === -1) {
        editor.replaceRange(humanQuery + "\n```", cursor);
        editor.setCursor(editor.offsetToPos(cursorOffset));
        return;
      }

      const codeBlockContent =
        contentBeforeCursor.substring(0, startCodeBlock) +
        "```alfonso\n" +
        humanQuery +
        "\n```\n" +
        contentAfterCursor.substring(endCodeBlock + 3);
      editor.setValue(codeBlockContent);
      editor.setCursor(editor.offsetToPos(cursorOffset));
    }
  }

  onOpen() {
    const _app = createApp(QueryBuilderModalVue, {
      plugin: this.plugin,
      modal: this,
      humanQuery: this.humanQuery,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
  }

  onClose() {
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }
}
