export class TMBaseItemSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item"],
      template: "systems/tm/templates/item/item-sheet.hbs",
      width: 500,
      height: 500
    });
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    console.log("🛠️ [TMBaseItemSheet] getData | Item:", this.item?.name);
    return context;
  }

  _activateCoreListeners(html) {
    console.warn("🛠️ [TMBaseItemSheet] Skipping _activateCoreListeners due to V1 bug.");
    return;
  }
}
