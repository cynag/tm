import { CardsDB } from "../cards/cards-db.js";
import { SkillsDB } from "../talents/skills-db.js";
import { KnowledgesDB } from "../talents/knowledges-db.js";

export class TMActor extends Actor {
 async prepareBaseData() {

  super.prepareBaseData();
  const s = this.system;

  // === GEAR SLOTS ===
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

  // === ATRIBUTOS BASE ===
  s.base_letality   ??= 0;
  s.base_dexterity  ??= 0;
  s.base_impulse    ??= 0;
  s.base_arcana     ??= 0;
  s.base_erudition  ??= 0;
  s.base_virtue     ??= 0;
  s.base_hp         ??= 0;

  // Reset dos valores principais
  s.player_letality   = s.base_letality;
  s.player_dexterity  = s.base_dexterity;
  s.player_impulse    = s.base_impulse;
  s.player_arcana     = s.base_arcana;
  s.player_erudition  = s.base_erudition;
  s.player_virtue     = s.base_virtue;


  // === SECUNDÁRIOS / INICIAIS ===
  if (!Number.isInteger(s.player_reflex)) s.player_reflex = 0;
  if (!Number.isInteger(s.player_wisdom)) s.player_wisdom = 0;
  if (!Number.isInteger(s.player_maneuver)) s.player_maneuver = 0;
  if (!Number.isInteger(s.player_resistance_phys)) s.player_resistance_phys = 0;
  if (!Number.isInteger(s.player_resistance_mental)) s.player_resistance_mental = 0;
  if (!Number.isInteger(s.player_protection)) s.player_protection = 0;
  if (!Number.isInteger(s.player_initiative)) s.player_initiative = 0;
  if (!Number.isInteger(s.player_movement)) s.player_movement = 0;
  if (!Number.isInteger(s.player_knowledge)) s.player_knowledge = 0;

  // === VITAIS ===
  if (!Number.isInteger(s.player_level)) s.player_level = 1;
  if (!Number.isInteger(s.player_hp)) s.player_hp = 10;
  if (!Number.isInteger(s.player_hp_max)) s.player_hp_max = 10;
  if (!Number.isInteger(s.player_pa)) s.player_pa = 8;
  if (!Number.isInteger(s.player_pa_max)) s.player_pa_max = 8;
  if (s.player_hp > s.player_hp_max) s.player_hp = s.player_hp_max;
  s.player_pa = Math.min(s.player_pa, s.player_pa_max);

  // === TALENTOS ===
s.talents ??= {};
s.talents.skills ??= {};
s.talents.knowledges ??= {};

for (const skill of SkillsDB) {
  const id = skill.id;
  if (!s.talents.skills[id]) {
    s.talents.skills[id] = { level: 0 };
  }
}

for (const knowledge of KnowledgesDB) {
  const id = knowledge.id;
  if (!s.talents.knowledges[id]) {
    s.talents.knowledges[id] = { level: 0 };
  }
}



  // === BUFFS POR CARTAS ESCOLHIDAS NO CARD PANEL ===
s.player_hp_max = 10; // Reset base
const selected = s.activeCards || {};
for (const [level, ids] of Object.entries(selected)) {
  for (const id of ids) {
    const carta = CardsDB[level]?.find(c => c.id === id);
    if (!carta || Number(level) > s.player_level) continue;

    const b1 = carta.buff1;
    const b2 = carta.buff2;
    const validAttrs = ["letality", "dexterity", "impulse", "arcana", "erudition", "virtue"];

    if (validAttrs.includes(b1)) s[`player_${b1}`] += 2;
    if (validAttrs.includes(b2)) s[`player_${b2}`] += 1;
    if (Number.isInteger(carta.hp)) {
      s.player_hp_max += carta.hp;
    }
  }
}



  // === CRÔNICA E CORINGAS ===
  s.player_chronicle ??= "";

// === ORIGEM (via flag) ===
const originScript = await this.getFlag("tm", "originScript");

if (originScript) {
  try {
    const fn = eval(`(${originScript})`);
    if (typeof fn === "function") {
      await fn(this);
      //console.log(`[ORIGIN] Script da origem executado via flag.`);
    }
  } catch (err) {
    console.warn(`[ORIGIN] Erro ao executar script da origem via flag:`, err);
  }
}



  // === BUFFS POR RAÇA (via flag) ===
const race = this.getFlag("tm", "raceData");
const subrace = this.getFlag("tm", "subRaceData");

const validAttrs = ["letality", "dexterity", "impulse", "arcana", "erudition", "virtue", "protection"];

if (subrace) {
  const sb1 = subrace.buff1;
  const sb2 = subrace.buff2;
  if (validAttrs.includes(sb1)) s[`player_${sb1}`] += 1;
  if (validAttrs.includes(sb2)) s[`player_${sb2}`] += 1;
} else if (race && !race.subraces?.length) {
  const buff1 = race.buff1;
  const buff2 = race.buff2;
  if (validAttrs.includes(buff1)) s[`player_${buff1}`] += 1;
  if (validAttrs.includes(buff2)) s[`player_${buff2}`] += 1;
}

// === SABEDORIA FINAL ===
const erud = s.player_erudition;
s.player_knowledge = 14 + erud;


// === MODIFICADORES DE ATRIBUTO ===
function calcMod(val) {
  if (val === 0) return -1;
  return Math.floor(val / 2);
}

s.mod_letality   = calcMod(s.player_letality);
s.mod_dexterity  = calcMod(s.player_dexterity);
s.mod_impulse    = calcMod(s.player_impulse);
s.mod_arcana     = calcMod(s.player_arcana);
s.mod_erudition  = calcMod(s.player_erudition);
s.mod_virtue     = calcMod(s.player_virtue);
s.mod_protection = Math.floor(s.player_protection / 2); // ⚠️ PROT segue lógica normal



console.log("[Actor] Modificadores aplicados:", {
  LET: s.mod_letality,
  DES: s.mod_dexterity,
  IMP: s.mod_impulse,
  ARC: s.mod_arcana,
  ERU: s.mod_erudition,
  VIR: s.mod_virtue
});



  // === RESISTÊNCIAS ===
  const defaultResistances = {
    slashing: 0, piercing: 0, bludgeoning: 0,
    fire: 0, cold: 0, electricity: 0, acid: 0,
    poison: 0, radiant: 0, necrotic: 0, psychic: 0, chaotic: 0
  };
  s.resistances ??= {};
  const resistList = Object.keys(defaultResistances);
  for (let res of resistList) {
    if (!Number.isInteger(s.resistances[res])) s.resistances[res] = 0;
  }
  s.resistances = foundry.utils.mergeObject(defaultResistances, s.resistances || {}, { inplace: false });
}

// temporario
async _preCreateEmbeddedDocuments(embeddedName, data, options, userId) {
  if (embeddedName !== "Item") return true;

  const items = Array.isArray(data) ? data : [data];
  const incoming = await Promise.all(items.map(i => {
    if (i.type) return i;
    return Item.implementation.fromDropData(i).then(d => d.toObject());
  }));

  for (let item of incoming) {
    const type = item.type;


    if (type === "origin") {
      const existing = this.items.find(i => i.type === "origin");
      if (existing) await existing.delete();
    }
  }

  return true;
}





  
}
