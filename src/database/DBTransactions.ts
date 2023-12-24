import { App } from "obsidian";
import BaseDB from "./BaseDB";

export class DBTransactions extends BaseDB {
  $id = "transactions";

  constructor(app: App, dbLocation: string) {
    super(app, dbLocation + "/transactions.json");
  }
}
