// src/item/language-sheet.js
export class LanguageSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item"],
      template: "systems/tm/templates/item/language-sheet.hbs",
      width: 300,
      height: "auto"
    });
  }

  getData() {
    const data = super.getData();
    data.item = this.item;
    return data;
  }
}
