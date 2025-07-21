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
      this.system.broken_sprite ??= "";
    }

    if (this.type === "gear" && this.system.gear_type === "armor") {
  this.system.armor_protection   ??= 0;
  this.system.armor_efficiency   ??= 100; // padrão: 100%
  this.system.armor_requeriment  ??= 0;
  this.system.armor_broken       ??= false;

  this.system.armor_traits ??= {};
  this.system.armor_traits.trait_metal      ??= 0;
  this.system.armor_traits.trait_noisy      ??= 0;
  this.system.armor_traits.trait_reinforced ??= 0;
  this.system.armor_traits.trait_heavy      ??= 0;
  this.system.armor_traits.trait_thermic    ??= 0;
}

if (this.type === "gear" && this.system.gear_type === "weapon") {
  // Categorias adicionais
this.system.weapon_subtypes_2 ??= ""; // cortante, perfurante, impacto
this.system.weapon_subtypes_3 ??= ""; // leve, pesada
this.system.weapon_damage     ??= ""; // ex: 2d6 ou 1d6+1d4[fire]
this.system.weapon_range      ??= 1;  // alcance simples

// Traços da arma
this.system.weapon_traits ??= {};
this.system.weapon_traits.weapon_trait_2h ??= false;
this.system.weapon_traits.weapon_trait_pom               ??= false;
this.system.weapon_traits.weapon_trait_heavy             ??= 0;
this.system.weapon_traits.weapon_trait_defensive         ??= 0;
this.system.weapon_traits.weapon_trait_shield            ??= 0;
this.system.weapon_traits.weapon_trait_desc              ??= 0;
this.system.weapon_traits.weapon_trait_fast              ??= 0;
this.system.weapon_traits.weapon_trait_ironbreaker ??= false;
this.system.weapon_traits.weapon_trait_vulnerable ??= false;

// Lógica de traços de penetração e quebra-ferro
const perf = this.system.weapon_subtypes_2 === "perfurante";
const quebraFerro = !!this.system.weapon_traits.weapon_trait_ironbreaker;

if (quebraFerro) {
  this.system.weapon_traits.weapon_trait_penetrable = false; // sobrepõe
} else {
  this.system.weapon_traits.weapon_trait_penetrable = perf;
}
this.system.weapon_traits.weapon_trait_recharge = Number(this.system.weapon_traits.weapon_trait_recharge ?? 0);


this.system.weapon_broken ??= false;


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
        // Sprites por quantidade
        // Sprites por quantidade
         data.ammo_sprites ??= {};
        data.ammo_sprites.s1 ??= "";
        data.ammo_sprites.s2 ??= "";
        data.ammo_sprites.s3 ??= "";
        data.ammo_sprites.s4 ??= "";
        data.ammo_sprites.s5 ??= "";
        data.ammo_sprites.s6 ??= "";

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


// Sprite quebrado (gear)
if (this.type === "gear") {
  const isBroken = this.system.armor_broken || this.system.weapon_broken;
  const brokenSprite = this.system.broken_sprite;

  if (isBroken && brokenSprite) {
    this.img = brokenSprite;
  }
}

this.system.gear_isArcane ??= false;
this.system.gear_arcaneType ??= "";
this.system.gear_arcaneCharges ??= 0;
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
  async _preDelete(options, user) {
  const actor = this.parent;
  if (!actor) return super._preDelete(options, user);

  // 🔥 Desvincula munição se esta arma estava usando uma
  if (this.type === "gear" && this.system.gear_type === "weapon") {
    await game.tm.GearManager.unlinkAmmoFromWeapon(actor, this.id);
  }

  // 🔥 Desvincula se for a munição usada por alguma arma
  if (this.type === "consumable" && this.system.category === "ammo") {
    if (this.flags?.tm?.linkedWeapon) {
      const weapon = actor.items.get(this.flags.tm.linkedWeapon);
      if (weapon) {
        await weapon.update({ "system.weapon_ammo_bonus": 0 });
      }
    }
  }

  return super._preDelete(options, user);
}

}



