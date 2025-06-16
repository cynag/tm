export class TMObject extends Item {
  prepareBaseData() {
    super.prepareBaseData();

    const data = this.system;

    // Grid size
    if (!data.grid) data.grid = {};
    if (!Number.isInteger(data.grid.w) || data.grid.w < 1) data.grid.w = 1;
    if (!Number.isInteger(data.grid.h) || data.grid.h < 1) data.grid.h = 1;

    // Valor e descrição
    if (typeof data.value !== "number") data.value = 0;
    if (typeof data.description !== "string") data.description = "";

    // Raridade
    if (!["common", "uncommon", "rare", "epic"].includes(data.rarity))
      data.rarity = "common";

    // =============================
    // GEAR (arma / armadura / acessório)
    // =============================
    if (this.type === "gear") {
      const gearTypes = ["weapon", "armor", "accessory"];
      if (!gearTypes.includes(data.gear_type)) data.gear_type = "weapon";

      if (typeof data.subtype !== "string") data.subtype = "";
    }

    // =============================
    // CONSUMABLE
    // =============================
    if (this.type === "consumable") {
      const validCategories = ["alchemical", "drug", "tool", "medicinal", "ammo", "scroll", "provision", "resource"];
      if (!validCategories.includes(data.category)) data.category = "resource";
      if (typeof data.subtype !== "string") data.subtype = "";

      if (data.category === "provision") {
        if (!Number.isInteger(data.provision_value)) data.provision_value = 0;
      }

      if (data.category === "ammo") {
        if (!Number.isInteger(data.ammo_damage)) data.ammo_damage = 0;
        if (!Number.isInteger(data.ammo_quantity)) data.ammo_quantity = 0;
        if (!Number.isInteger(data.stack_value)) data.stack_value = 10;
      }
    }
  }
}
