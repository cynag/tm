import { TMBaseItemSheet } from "./tm-base-item-sheet.js";

export class TMItemSheet extends TMBaseItemSheet {
  async getData(options = {}) {
    const context = await super.getData(options);
    console.log("🛠️ [TMItemSheet] getData | Item:", this.item?.name);
    return context;
  }
}
