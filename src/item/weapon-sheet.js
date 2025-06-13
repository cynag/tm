export class WeaponSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "weapon"],
      template: "systems/tm/templates/item/weapon-sheet.hbs",
      width: 400,
      height: "auto"
    });
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.subtypes = ["sword", "axe", "spear", "hammer", "bow", "crossbow", "gun", "shield"];
    return context;
  }

  async _updateObject(event, formData) {
    formData["system.grid.w"] = Math.max(1, parseInt(formData["system.grid.w"] || 1));
    formData["system.grid.h"] = Math.max(1, parseInt(formData["system.grid.h"] || 1));
    return super._updateObject(event, formData);
  }
}
