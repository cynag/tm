export class RaceSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item"],
      width: 400,
      height: 350,
      template: "systems/tm/templates/item/race-sheet.hbs",
      resizable: false
    });
  }

  getData() {
    const data = super.getData();
    data.item = this.item;
    return data;
  }
}
