export class ConsumableSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "consumable"],
      template: "systems/tm/templates/item/consumable-sheet.hbs",
      width: 400,
      height: "auto"
    });
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.categories = ["alchemical", "drug", "tool", "medicinal", "ammo", "scroll", "provision", "resource", "artefact"];
    context.subtypes = {
      provision: ["alcohol", "animal", "beverage", "meat", "grain", "spice", "fruit", "fungus", "meal", "seed", "vegetable"],
      ammo: ["arrow", "bolt", "slug"],
      medicinal: ["sedative", "soothing", "healing", "stimulant", "stabilizer", "preventive", "purifier", "tool"],
      alchemical: ["potion", "poison", "catalyst"]
    };
    return context;
  }

  async _updateObject(event, formData) {
    formData["system.grid.w"] = Math.max(1, parseInt(formData["system.grid.w"] || 1));
    formData["system.grid.h"] = Math.max(1, parseInt(formData["system.grid.h"] || 1));
    return super._updateObject(event, formData);
  }
}
