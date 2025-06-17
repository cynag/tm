const { ItemSheet } = foundry.appv1.sheets;

export class OriginSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item"],
      template: "systems/tm/templates/item/origin-sheet.hbs",
      width: 400,
      height: 300
    });
  }

  getData() {
    const data = super.getData();
    data.item = this.item;
    return data;
  }
}
