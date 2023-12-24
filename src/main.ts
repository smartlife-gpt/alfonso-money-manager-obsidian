import { Plugin, TFile, TFolder, type PluginManifest, App } from "obsidian";

import { DBAlfonso } from "./database/DBAlfonso";
import CodeBlockProcessor from "./plugin/CodeBlockProcessor";
import { SampleSettingTab } from "./settings/SampleSettingTab";
import type { AlfonsoPluginSettings } from "./types/MyPluginSettings";
import ExchangeRateManager from "./plugin/ExchangeRateService";
import QueryBuilderModalCommand from "./plugin/commands/QueryBuilderModalCommand";

const DEFAULT_SETTINGS: AlfonsoPluginSettings = {
  databaseLocations: [],
  showQueryBuilderButton: true,
};

export default class AlfonsoPlugin extends Plugin {
  settings!: AlfonsoPluginSettings;
  databases = new Map<string, DBAlfonso>();
  exchangeRateManager: ExchangeRateManager;

  onSettingsChangedObservers: ((settings: AlfonsoPluginSettings) => void)[] =
    [];

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);

    this.exchangeRateManager = ExchangeRateManager.getInstance();
  }

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SampleSettingTab(this.app, this));

    QueryBuilderModalCommand.register(this);

    new CodeBlockProcessor(this).register();

    await this.exchangeRateManager.ensureLatestRates();
  }

  isValidDatabaseLocation(databaseLocation: string) {
    if (databaseLocation == undefined) {
      return false;
    }
    if (databaseLocation.length == 0) {
      return false;
    }

    const dbLocation = this.app.vault.getAbstractFileByPath(databaseLocation);
    if (dbLocation == undefined || dbLocation instanceof TFile) {
      return false;
    }

    const children = (dbLocation as TFolder).children;
    if (children == undefined || children.length == 0) {
      return false;
    }
    const dbFiles = [
      "wallets.json",
      "budgets.json",
      "categories.json",
      "events.json",
      "transactions.json",
    ];

    for (const dbFile of dbFiles) {
      if (!children.some((child) => child.name == dbFile)) {
        return false;
      }
    }

    return true;
  }

  async getDatabase(databaseLocation: string) {
    if (this.databases.has(databaseLocation)) {
      return this.databases.get(databaseLocation);
    }

    const db = new DBAlfonso(this.app, databaseLocation);
    await db.loadDatabases();

    this.databases.set(databaseLocation, db);

    return db;
  }

  onunload() {
    console.log("unloading plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(settings: AlfonsoPluginSettings) {
    this.settings = settings;
    await this.saveData(settings);
    this.notifySettingsChanged();
  }

  onSettingsChanged(callback: (settings: AlfonsoPluginSettings) => void) {
    this.onSettingsChangedObservers.push(callback);
  }

  notifySettingsChanged() {
    for (const observer of this.onSettingsChangedObservers) {
      observer(this.settings);
    }
  }
}
