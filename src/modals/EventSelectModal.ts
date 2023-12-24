import type { EventType } from "@/types/EventType";
import EventSelectModalVue from "@/ui/modals/EventSelectModal.vue";
import { App, Modal, Plugin } from "obsidian";
import { createApp, type App as VueApp } from "vue";

export class EventSelectModal extends Modal {
  _vueApp: VueApp | undefined;
  plugin: Plugin;

  observers: ((event: EventType) => void)[] = [];

  constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
  }

  openToSelect(database: string, walletID: number) {
    const _app = createApp(EventSelectModalVue, {
      plugin: this.plugin,
      modal: this,
      database: database,
      walletID: walletID,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
    this.open();
  }

  onSelected(callback: (event: EventType) => void) {
    this.observers.push(callback);
  }

  notifyObservers(event: EventType) {
    this.observers.forEach((callback) => callback(event));
  }

  onOpen() {}

  onClose() {
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }
}
