export class TMObjectSheet extends foundry.appv1.sheets.ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "object"],
      template: "systems/tm/templates/item/object-sheet.hbs",
      width: 400,
      height: 400
    });
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.item.system;
    return context;
  }
}
