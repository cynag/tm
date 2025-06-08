import { TMBaseActorSheet } from "./tm-base-actor-sheet.js";

export class TMActorSheet extends TMBaseActorSheet {
  async getData(options = {}) {
    const context = await super.getData(options);
    console.log("🛠️ [TMActorSheet] getData | Actor:", this.actor?.name);
    return context;
  }
}
