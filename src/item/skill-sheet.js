export class SkillSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item"],
      template: "systems/tm/templates/item/skill-sheet.hbs",
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
