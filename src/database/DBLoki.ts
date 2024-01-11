import Loki from "lokijs";
import { App, TFolder } from "obsidian";

function base64Decode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

export default class DBLoki extends Loki {
  app: App;

  constructor(
    filename: string,
    app: App,
    options?: Partial<LokiConstructorOptions> &
      Partial<LokiConfigOptions> &
      Partial<ThrottledSaveDrainOptions>
  ) {
    super(filename, options);
    this.app = app;
  }

  private async readDatabase(): Promise<string | undefined> {
    try {
      const databaseFile = this.app.vault.getAbstractFileByPath(this.filename);
      if (!databaseFile || databaseFile instanceof TFolder) {
        return;
      }

      const result = await this.app.vault.adapter.read(this.filename);

      return result;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  public async loadDatabase(
    options?: Partial<ThrottledSaveDrainOptions>,
    callback?: (err: any) => void
  ): Promise<void> {
    try {
      const result = await this.readDatabase();
      if (!result) {
        throw new Error("File not found");
      }

      const dbJSON = base64Decode(result); // Decode base64 to string
      this.loadJSONObject(JSON.parse(dbJSON));

      callback && callback(null);
    } catch (err) {
      console.error(err);
      super.loadDatabase(options, callback);
    }
  }

  public async saveDatabase() {
    // We dont write to the DB
  }
}
