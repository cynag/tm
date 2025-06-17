export class TMActor extends Actor {
  prepareBaseData() {
    super.prepareBaseData();

    const s = this.system; // ✅ Corrige erro de "s is not defined"

    this.system.gearSlots = foundry.utils.mergeObject({
      slot_head:     { itemId: null, width: 3, height: 3 },
      slot_neck:     { itemId: null, width: 1, height: 2 },
      slot_shoulder: { itemId: null, width: 3, height: 3 },
      slot_torso:    { itemId: null, width: 3, height: 4 },
      slot_legs:     { itemId: null, width: 3, height: 4 },
      slot_foots:    { itemId: null, width: 3, height: 3 },
      slot_hands:    { itemId: null, width: 3, height: 3 },
      slot_ring1:    { itemId: null, width: 1, height: 1 },
      slot_ring2:    { itemId: null, width: 1, height: 1 },
      slot_back:     { itemId: null, width: 3, height: 4 },
      slot_waist:    { itemId: null, width: 3, height: 1 },
      slot_weapon1:  { itemId: null, width: 5, height: 4 },
      slot_weapon2:  { itemId: null, width: 5, height: 4 }
    }, this.system.gearSlots || {}, { inplace: false });

    // Atributos principais (base)
    s.base_letality   ??= 0;
    s.base_dexterity  ??= 0;
    s.base_impulse    ??= 0;
    s.base_arcana     ??= 0;
    s.base_erudition  ??= 0;
    s.base_virtue     ??= 0;
    s.base_hp         ??= 0;

    // Reset para os valores atuais, antes dos buffs
    s.player_letality   = s.base_letality;
    s.player_dexterity  = s.base_dexterity;
    s.player_impulse    = s.base_impulse;
    s.player_arcana     = s.base_arcana;
    s.player_erudition  = s.base_erudition;
    s.player_virtue     = s.base_virtue;
    s.player_hp         = s.base_hp;

    // Atributos secundários
    if (!Number.isInteger(s.player_reflex)) s.player_reflex = 0;
    if (!Number.isInteger(s.player_wisdom)) s.player_wisdom = 0;
    if (!Number.isInteger(s.player_maneuver)) s.player_maneuver = 0;
    if (!Number.isInteger(s.player_resistance_phys)) s.player_resistance_phys = 0;
    if (!Number.isInteger(s.player_resistance_mental)) s.player_resistance_mental = 0;
    if (!Number.isInteger(s.player_protection)) s.player_protection = 0;
    if (!Number.isInteger(s.player_initiative)) s.player_initiative = 0;
    if (!Number.isInteger(s.player_movement)) s.player_movement = 0;

    // Vitais
    if (!Number.isInteger(s.player_pa)) s.player_pa = 0;
    if (!Number.isInteger(s.player_level)) s.player_level = 1;

    // Aplica efeitos das cartas do destino
    const seen = new Set();
const cards = this.items.filter(i => i.type === "card" && !seen.has(i.name) && seen.add(i.name));

    for (let card of cards) {
      const d = card.system;
      if (s.player_level >= d.card_level) {
        if (["letality", "dexterity", "impulse", "arcana", "erudition", "virtue"].includes(d.card_bonus_2)) {
          s[`player_${d.card_bonus_2}`] += 2;
        }
        if (["letality", "dexterity", "impulse", "arcana", "erudition", "virtue"].includes(d.card_bonus_1)) {
          s[`player_${d.card_bonus_1}`] += 1;
        }
        if (Number.isInteger(d.card_bonus_hp)) {
          s.player_hp += d.card_bonus_hp;
        }
      }
    }

    s.player_chronicle ??= "";

    const race = this.items.find(i => i.type === "race");
if (race) {
  const r = race.system;
  s[`player_${r.race_buff_1}`] += 1;
  s[`player_${r.race_buff_2}`] += 1;
  s.player_movement = r.race_movement;
}
// ORIGEM: executa o script do item origin
const origin = this.items.find(i => i.type === "origin");
if (origin?.system?.origin_effect_script) {
  try {
    const fn = new Function("actor", origin.system.origin_effect_script);
    fn(this);
    console.log(`[ORIGIN] Script da origem "${origin.name}" executado com sucesso.`);
  } catch (err) {
    console.warn(`[ORIGIN] Erro ao executar script da origem "${origin.name}":`, err);
  }
}
// TRAITS: executa scripts dos traços
const traits = this.items.filter(i => i.type === "trait");
for (let trait of traits) {
  const script = trait.system?.trait_effect_script;
  if (script) {
    try {
      const fn = new Function("actor", script);
      fn(this);
      console.log(`[TRAIT] Script de "${trait.name}" executado.`);
    } catch (err) {
      console.warn(`[TRAIT] Erro em "${trait.name}":`, err);
    }
  }
}


  }
// Previne múltiplas cartas com o mesmo nome
async _preCreateEmbeddedDocuments(embeddedName, data, options, userId) {
  if (embeddedName !== "Item") return true;

  const items = Array.isArray(data) ? data : [data];
  const incoming = await Promise.all(items.map(i => {
    if (i.type) return i;
    return Item.implementation.fromDropData(i).then(d => d.toObject());
  }));

  const existing = this.items;

  const uniqueTypes = ["card", "trait", "language"];
  const toCreate = [];

  for (let item of incoming) {
    const { type, name } = item;

    if (uniqueTypes.includes(type)) {
      const exists = existing.some(i => i.type === type && i.name === name);
      if (exists) {
        ui.notifications.warn(`Você já possui um(a) ${type} chamado "${name}".`);
        continue; // ❌ ignora
      }
    }

    if (type === "race") {
      const existingRace = existing.find(i => i.type === "race");
      if (existingRace) await existingRace.delete();
    }

    if (type === "origin") {
      const existingOrigin = existing.find(i => i.type === "origin");
      if (existingOrigin) await existingOrigin.delete();
    }

    toCreate.push(item);
  }

  // 🧼 se nenhum item for válido, bloqueia
  if (toCreate.length === 0) return false;

  // 🔁 sobrescreve os dados a serem criados
  options.keepId = true;
  foundry.utils.setProperty(options, "tmFilteredItems", toCreate);
  return true;
}








  
}
