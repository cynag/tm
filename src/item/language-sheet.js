export class LanguageSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item"],
      template: "systems/tm/templates/item/language-sheet.hbs",
      width: 300,
      height: 200
    });
  }

  getData() {
  const data = super.getData();
  data.system = this.item.system; // ✅ necessário para os bindings funcionarem
  data.item = this.item;
  return data;
}

}
