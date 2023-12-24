import { App } from "obsidian";
import BaseDB from "./BaseDB";
import type { EventType } from "@/types/EventType";

export class DBEvents extends BaseDB {
  $id = "events";

  constructor(app: App, dbLocation: string) {
    super(app, dbLocation + "/events.json");
  }

  getAllEvents(walletID: number, active: boolean) {
    const entitites = this.getCollection();
    const events = entitites.find({
      finished: !active,
      wallet: walletID,
    });
    return events as EventType[];
  }

  getEventByName(walletID: number, name: string) {
    const entitites = this.getCollection();
    const event = entitites.findOne({
      name: { $regex: new RegExp(name, "i") },
      wallet: walletID,
    });
    return event as EventType;
  }
}
