import type { CategoryType } from "@/types/CategoryType";
import CategorySelectModalVue from "@/ui/modals/CategorySelectModal.vue";
import { App, Modal, Plugin } from "obsidian";
import { createApp, type App as VueApp } from "vue";

export class CategorySelectModal extends Modal {
  _vueApp: VueApp | undefined;
  plugin: Plugin;

  observers: ((category: CategoryType) => void)[] = [];

  constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
  }

  openToSelect(database: string, walletID: number) {
    const _app = createApp(CategorySelectModalVue, {
      plugin: this.plugin,
      modal: this,
      database: database,
      walletID: walletID,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
    this.open();
  }

  onSelected(callback: (category: CategoryType) => void) {
    this.observers.push(callback);
  }

  notifyObservers(category: CategoryType) {
    this.observers.forEach((callback) => callback(category));
  }

  onOpen() {}

  onClose() {
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }
}
