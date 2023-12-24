import { App } from "obsidian";
import BaseDB from "./BaseDB";
import type { WalletType } from "@/types/WalletType";

export class DBWallets extends BaseDB {
  $id = "wallets";

  constructor(app: App, dbLocation: string) {
    super(app, dbLocation + "/wallets.json");
  }

  getAll() {
    const wallets = this.getCollection();
    return (wallets?.data as WalletType[]) ?? [];
  }

  getNameById(id: number) {
    const wallet = this.getCollection().by("$loki", id);
    return wallet?.name ?? "";
  }

  getIdByName(name: string) {
    const wallet = this.getCollection().by("name", name);
    return wallet?.$loki ?? -1;
  }
}
