import { App } from "obsidian";
import DBLoki from "./DBLoki";
import DBCache from "./DBCache";
import type { TransactionRecordType } from "@/types/TransactionRecordType";

export default class BaseDB {
  $id: string = "";

  app: App;
  dbLocation: string;

  db: DBLoki;
  cache: DBCache;

  constructor(app: App, dbLocation: string) {
    this.app = app;
    this.dbLocation = dbLocation;

    this.db = new DBLoki(dbLocation, app, {
      autoload: true,
      autosave: false,
    });
    this.cache = new DBCache();
    this.app.vault.on("modify", (file) => {
      if (file.path == this.dbLocation) {
        this.cache.invalidate();
      }
    });
  }

  loadDatabase() {
    return this.db.loadDatabase();
  }

  getCollection() {
    return this.db.getCollection(this.$id);
  }

  getById(id: number, walletId?: number) {
    const collection = this.getCollection();
    const query = { $loki: id } as any;
    if (walletId) {
      query.wallet = walletId;
    }

    const result = collection.findOne(query);

    return result;
  }

  execQuery(query: any): TransactionRecordType[] {
    const cacheKey = this.cache.getKey(query);
    if (this.cache.has(query)) {
      return this.cache.get(query);
    }

    const result = this.getCollection().find(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  close() {
    this.db.close();
  }
}
