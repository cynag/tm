export class CardSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item", "card"],
      width: 500,
      height: 400,
      resizable: false,
      template: "systems/tm/templates/item/card-sheet.hbs",
    });
  }

  async getData(options) {
    const data = await super.getData(options);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
