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
      const validCategories = [
      "alchemical", "drug", "tool", "medicinal", "ammo",
      "scroll", "provision", "resource", "artefact"];
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

// =============================
// RACE
// =============================

if (this.type === "race") {
  if (!["letality", "dexterity", "impulse", "arcana", "erudition", "virtue"].includes(data.race_buff_1)) data.race_buff_1 = "letality";
  if (!["letality", "dexterity", "impulse", "arcana", "erudition", "virtue"].includes(data.race_buff_2)) data.race_buff_2 = "dexterity";
  if (!Number.isInteger(data.race_movement)) data.race_movement = 4;
  if (typeof data.race_maestry !== "string") data.race_maestry = "";
}
// =============================
// LANGUAGE
// =============================
if (this.type === "language") {
  const levels = ["rudimentary", "intermediate", "fluent"];
  const data = this.system;
  if (!levels.includes(data.language_level)) data.language_level = "rudimentary";
}
// =============================
// TRAIT
// =============================
if (this.type === "trait") {
  if (!Array.isArray(this.system.tags)) {
    this.system.tags = [];
  }
}




  }
  async _preCreate(data, options, user) {
  const actor = this.parent;
  if (!actor) return super._preCreate(data, options, user);

  if (this.type === "race") {
    const existing = actor.items.find(i => i.type === "race");
    if (existing) {
      console.log(`[Raça] Substituindo "${existing.name}" por "${this.name}"`);
      await existing.delete();
    }
  }

  if (this.type === "origin") {
    const existing = actor.items.find(i => i.type === "origin");
    if (existing) {
      console.log(`[Origem] Substituindo "${existing.name}" por "${this.name}"`);
      await existing.delete();
    }
  }

  return super._preCreate(data, options, user);
}

}



