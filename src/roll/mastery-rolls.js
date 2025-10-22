// src/roll/mastery-rolls.js
// Internals em EN; UI em PT-BR.
// Exports:
//  - MasteryCureRoll (class with .roll)
//  - MasteryMagicAttackRoll (object with .roll)
//  - MasteryMeleeAttackRoll (object with .roll)

import { MasteryParser } from "../mastery/mastery-parser.js";

console.log("[MASTERIES] mastery-rolls.js (v13 fix) loaded");

// ------------------------------ Utilities ------------------------------
const UI = {
  type: { action: "AÇÃO", conjuration: "CONJURAÇÃO", reaction: "REAÇÃO", stance: "POSTURA", passive: "PASSIVA" },
  elementsPT: { fire: "fogo", ice: "gelo", electric: "eletrico", poison: "veneno", acid: "acido", psychic: "mental", radiant: "radiante", necrotic: "necrotico", chaotic: "caotico" },
  dmgPT: { piercing: "perfurante", slashing: "cortante", bludgeoning: "impacto" }
};
const isDice = (s) => typeof s === "string" && /(^|[+\-*/(])\s*\d+d\d+/i.test(s);
const n = (v, d=0) => Number.isFinite(+v) ? +v : d;

function headerTagsHtml(mastery, extras = []) {
  return `
    <div class="chat-header" style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      <img class="chat-img" src="${mastery.img}" width="35" height="35" style="border:1px solid #555;border-radius:4px;" />
      <div>
        <h2 class="chat-roll-name" style="margin:0 0 4px 0;font-size:16px;">${mastery.name}</h2>
        <div class="chat-tags" style="display:flex;gap:4px;justify-content:flex-end;margin-bottom:2px;">
          <span class="tag">${UI.type[mastery.type] ?? mastery.type}</span>
          <span class="tag">${mastery.costPA ?? "–"} PA</span>
          <span class="tag">CD ${mastery.cd ?? "–"}</span>
          <span class="tag">${mastery.rangeM ?? "–"}m</span>
        </div>
        <div class="chat-tags" style="display:flex;gap:4px;justify-content:flex-end;margin-bottom:2px;">
          ${extras.join(" ")}
        </div>
      </div>
    </div>`;
}

function registerChatToggleOnce() {
  if (registerChatToggleOnce._done) return;
  Hooks.on("renderChatMessage", (msg, html) => {
    if (html.hasClass("tm-processed")) return;
    html.addClass("tm-processed");
    html.find(".tm-outcome").on("click", function () {
      const details = $(this).closest(".tm-outcome").find(".tm-details");
      if (details.length) details.slideToggle(150);
    });
  });
  registerChatToggleOnce._done = true;
  console.log("[MASTERIES] toggle hook registered");
}

function diceObjs(roll) {
  const DieTerm = foundry?.dice?.terms?.Die;
  const out = [];
  if (!roll?.terms || !DieTerm) return out;
  for (const term of roll.terms) {
    if (term instanceof DieTerm) for (const r of term.results) out.push({ result: r.result, faces: term.faces });
  }
  return out;
}

async function evalWithParser(expr, actor, target, mode, domain) {
  if (!expr) return null;
  try { return await MasteryParser.evaluate(expr, actor, target, mode, domain); }
  catch (e) { console.warn("[MASTERIES] eval error:", expr, e); return null; }
}
// normaliza chaves de elemento para bater com actor.system.resistances.*
function normalizeElementKey(key) {
  const k = String(key || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const map = {
    fogo: "fire", calor: "fire",
    gelo: "ice", frio: "ice",
    eletrico: "electric", eletricidade: "electric", raio: "electric",
    veneno: "poison",
    acido: "acid",
    mental: "psychic",
    radiante: "radiant",
    necrotico: "necrotic",
    caotico: "chaotic"
  };
  return map[k] || k;
}

// ------------------------------ Adapters ------------------------------
function normalizeMastery(raw) {
  return {
    id: raw.id ?? raw._id,
    name: raw.mastery_name ?? raw.name,
    img: raw.mastery_img ?? raw.img,
    type: raw.mastery_type ?? raw.type ?? "action",
    costPA: raw.mastery_cost ?? raw.costPA,
    cd: raw.mastery_cd ?? raw.cd,
    rangeM: raw.mastery_range ?? raw.rangeM,
    domain: raw.mastery_domain ?? raw.system?.domain,
    tags: raw.mastery_tags ?? raw.tags ?? [],
    hasRoll: raw.has_roll !== false,
    needTarget: raw.need_target !== false,
    // magic
    attackFormula: raw.mastery_attack_formula ?? "direct",
    damageFormula: raw.mastery_damage_formula ?? "0",
    element: (raw.mastery_element ?? "fire").toLowerCase(),
    damageTypeMagic: raw.mastery_damage_type ?? "normal",
    autoHit: raw.mastery_auto_hit === true,
    spellAtkB1: raw.spell_attack_bonus ?? "",
    spellAtkB2: raw.spell_attack_bonus_2 ?? "",
    spellDmgB1: raw.spell_damage_bonus ?? "",
    spellDmgB2: raw.spell_damage_bonus_2 ?? "",
    extraScript: raw.spell_extra ?? "",
    // melee
    wAtkB1: raw.weapon_attack_bonus ?? "",
    wAtkB2: raw.weapon_attack_bonus_2 ?? "",
    wDmgB1: raw.weapon_damage_bonus ?? "",
    // desc
    desc: raw.mastery_description ?? raw.description ?? "<i>Sem descrição</i>",
    descNumber: typeof raw.mastery_desc === "number" ? raw.mastery_desc : null,
    mastery_nd: raw.mastery_nd ?? raw.system?.nd
  };
}

function normalizeItemWeapon(item, isUnarmed=false) {
  const sys = item?.system ?? {};
  // Extrai APENAS o dano base (remove "{{ ... }}")
  let baseDamage = isUnarmed ? "1d2" : (sys.weapon_damage || "1d2");
  const m = baseDamage.match(/^\s*(.+?)\s*\{\{.*\}\}\s*$/);
  if (m) baseDamage = m[1].trim();

  return {
    subtype: (isUnarmed ? "unarmed" : (sys.subtype ?? "")).toLowerCase(),
    damageType: (isUnarmed ? "bludgeoning" : (sys.weapon_subtypes_2 || "bludgeoning"))
      .replace("cortante","slashing").replace("perfurante","piercing").replace("impacto","bludgeoning"),
    damageDice: baseDamage, // <- agora sempre sem "{{}}"
    rangeM: sys.weapon_range,
    traits: sys.weapon_traits || {}
  };
}

function armorIsMetal(targetSystem) { return !!targetSystem?.player_armor_is_metal; }

// ------------------------------ Common HTML ------------------------------
function diceIconsHTML(roll) {
  return diceObjs(roll).map(d => `
    <div class="dice-icon">
      <div class="dice-bg" style="background-image:url('systems/tm/styles/assets/dices/d${d.faces}.svg');"></div>
      <div class="dice-number">${d.result}</div>
    </div>`).join("");
}

function detailsBlockHTML({
  ref, protValue, shieldBroken,
  atkRoll, atkDiceTotal, atkBonusSum, atkTotal,
  dmgRollTray,
  dmgBaseShown,
  dmgBonusSum,
  resistLine = null,
  armorLine = null,
  elemExtraLine = null,
  elemResistLine = null,
  dmgFinal
}) {
  const shield = shieldBroken ? "shield-broken" : "shield";
  return `
  <div class="tm-details" style="display:none;margin-top:6px;font-size:12px;color:#aaa;padding:6px;background:#111;border:1px solid #333;border-radius:6px;">
    <strong>Detalhes:</strong>

    <div style="display:flex;justify-content:center;align-items:center;gap:12px;font-size:14px;font-weight:bold;margin:6px 0;">
      <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:#fff;text-shadow:1px 1px 2px #000;">${ref}</div>
      <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/${shield}.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:#fff;text-shadow:1px 1px 2px #000;">${protValue}</div>
    </div>

    <!-- 1) DADOS (imagens) -->
    <div style="display:flex;justify-content:center;gap:6px;margin:6px 0;flex-wrap:wrap;max-width:320px;margin-inline:auto;">
      ${diceIconsHTML(atkRoll)}
    </div>

    <div style="display:flex;justify-content:center;gap:6px;margin:6px 0;flex-wrap:wrap;max-width:320px;margin-inline:auto;">
      ${dmgRollTray}
    </div>

    <hr style="border:0;border-top:1px solid #444;margin:8px 0;" />

    <!-- 2) DETALHES (texto) -->
    <div style="font-size:13px;color:#ccc;">
      <!-- ATAQUE -->
      <div style="display:flex;justify-content:space-between;"><span>Dados de Ataque:</span><span>${atkDiceTotal}</span></div>
      ${atkBonusSum !== 0 ? `<div style="display:flex;justify-content:space-between;"><span>Acréscimos:</span><span>${atkBonusSum>0?"+":""}${atkBonusSum}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;font-weight:bold;"><span>Valor Final:</span><span>${atkTotal}</span></div>

      <hr style="border:0;border-top:1px solid #333;margin:8px 0;" />

      <!-- DANO -->
      <div style="display:flex;justify-content:space-between;"><span>Dados de Dano:</span><span>${dmgBaseShown}</span></div>
      ${dmgBonusSum !== 0 ? `<div style="display:flex;justify-content:space-between;"><span>Acréscimos:</span><span>${dmgBonusSum>0?"+":""}${dmgBonusSum}</span></div>` : ""}
      ${armorLine ? `<div style="display:flex;justify-content:space-between;"><span>${armorLine.text}</span><span>${armorLine.value ?? ""}</span></div>` : ""}
      ${elemExtraLine ? `<div style="display:flex;justify-content:space-between;"><span>${elemExtraLine.text}</span><span>${elemExtraLine.value}</span></div>` : ""}
      ${elemResistLine ? `<div style="display:flex;justify-content:space-between;"><span>${elemResistLine.text}</span><span>${elemResistLine.value}</span></div>` : ""}
      ${resistLine ? `<div style="display:flex;justify-content:space-between;"><span>${resistLine.text}</span><span>${resistLine.value}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;font-weight:bold;"><span>Dano Final:</span><span>${dmgFinal}</span></div>
    </div>
  </div>`;
}




// ------------------------------ 1) Cure ------------------------------
export class MasteryCureRoll {
  static async roll({ caster, targets = [], mastery }) {
    try {
      if (!caster) { ui.notifications.warn("Selecione o conjurador."); return { ok:false, reason:"NO_CASTER" }; }
      if (!Array.isArray(targets) || targets.length === 0) { ui.notifications.warn("Selecione ao menos um alvo."); return { ok:false, reason:"NO_TARGETS" }; }

      const M = normalizeMastery(mastery);
      const base = await evalWithParser(M.damageFormula || "0", caster, null, "roll", M.domain);
      let total = n(base?.value, 0);

      const rollsToShow = [];
      if (base?.roll) rollsToShow.push(base.roll);

      const addBonus = async (expr) => {
        if (!expr) return 0;
        const mode = isDice(expr) ? "roll" : "number";
        const r = await evalWithParser(expr, caster, null, mode, M.domain);
        if (r?.roll) rollsToShow.push(r.roll);
        return n(r?.value, 0);
      };
      total += await addBonus(M.spellDmgB1);
      total += await addBonus(M.spellDmgB2);
      total = Math.max(0, total);

      const targetNames = targets.map(t => t.name ?? "???");
      const content = `
        <div class="chat-roll" style="font-family: var(--font-primary); font-size: 1.1em;">
          ${headerTagsHtml(M, [
            `<span class="tag">${mastery.mastery_damage_formula || "0"}</span>`,
            `<span class="tag">🩹 Cura</span>`,
            `<span class="tag">🎯 ${targetNames.join(", ")}</span>`
          ])}
          <div class="chat-description" style="font-size:13px;color:var(--color-text-light);margin-bottom:8px;">${M.desc}</div>
          <div class="tm-outcome">
            <div class="tm-row tm-damage" style="gap:8px;justify-content:center;">
              <span style="font-weight:bold;">Cura</span>
              <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:white;text-shadow:1px 1px 2px black;font-weight:bold;">${total}</div>
            </div>
          </div>
        </div>`;
      await ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: caster }), flavor: content, rolls: rollsToShow });
      registerChatToggleOnce();
      console.log("[CURE] ok", { total });
      return { ok:true, total };
    } catch (e) {
      console.error("[CURE] error", e); ui.notifications.error("Falha ao processar a cura."); return { ok:false, error:e };
    }
  }
}

// ------------------------------ 2) Magic Attack ------------------------------
async function rollMagicMastery({ attacker, targets = [], mastery, forcedDice }) {
  try {
    if (!attacker) { ui.notifications.warn("Você precisa selecionar um atacante."); return; }
    if (!Array.isArray(targets) || targets.length === 0) { ui.notifications.warn("Você precisa selecionar ao menos um alvo."); return; }

    const M = normalizeMastery(mastery);
    if (!M.hasRoll) {
      const fake = `
        <div class="chat-roll" style="font-family: var(--font-primary); font-size: 1.1em;">
          ${headerTagsHtml(M, (M.tags || []).map(t => `<span class="tag">${t}</span>`))}
          <div class="chat-description" style="font-size:13px;color:var(--color-text-light);margin-bottom:8px;">${M.desc}</div>
        </div>`;
      await ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: attacker }), flavor: fake });
      return;
    }

    const DieTerm = foundry?.dice?.terms?.Die;
// classes de cor (EN/PT/sem acento)
let elemColorClass = "";           // ex.: dice-fire
let elemColorClassPT = "";         // ex.: dice-fogo / dice-ácido
let elemColorClassPTNoAccent = ""; // ex.: dice-acido


    for (const t of targets) {
      
      
      const targetSystem = t.actor?.system; if (!targetSystem) continue;

    // choose best element (normalizado)
    const elementOptions = M.element.split("||").map(s => s.trim()).filter(Boolean);
    let chosenRaw = elementOptions[0] || "fire";
    let chosenKey = normalizeElementKey(chosenRaw);

    let best = -999;
    for (const elOpt of elementOptions) {
      const k = normalizeElementKey(elOpt);
      const b = n(attacker.system?.player_damage_bonus?.[k], 0);
      if (b > best) { best = b; chosenRaw = elOpt; chosenKey = k; }
    }
const elemPT = UI.elementsPT[chosenKey] ?? chosenKey;
console.log("[MAGIC][ELEMENT]", { chosenRaw, chosenKey, bonusBest: best });

// classes CSS para colorir os dados do dano mágico
elemColorClass = `dice-${chosenKey}`; // EN (fix: sem const)

// PT (mantém nomes que seu CSS usa, com acento quando aplicável)
const ptMap = {
  fire: "dice-fogo",
  ice: "dice-gelo",
  electric: "dice-eletrico",
  poison: "dice-veneno",
  acid: "dice-ácido",       // com acento (seu CSS já usa)
  psychic: "dice-mental",
  radiant: "dice-radiante",
  necrotic: "dice-necrotico",
  chaotic: "dice-caotico"
};
elemColorClassPT = ptMap[chosenKey] || "";
elemColorClassPTNoAccent = (elemColorClassPT || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"");

console.log("[MAGIC][COLOR]", { elemColorClass, elemColorClassPT, elemColorClassPTNoAccent });


      // attack
      let hit = true, atkRoll=null, atkTotal="–", resultLabel="Direto";
      let atkBonusSum=0, dmgBonusSum=0, atkDiceTotal=0, isCrit=false, isMutil=false;

      if (M.attackFormula === "default") {
        if (M.autoHit) {
          hit = true; resultLabel = "Automático"; atkTotal = "✔️";
        } else {
          const baseDice = n(attacker.system?.player_action_dice,3);
          const extraDice = n(attacker.system?.player_extra_dice?.[chosenKey],0);

          const totalDice = forcedDice ?? (baseDice + extraDice);
          const baseRoll = new Roll(`${totalDice}d6`); await baseRoll.evaluate(); atkRoll = baseRoll;

          const atkF1 = !isDice(M.spellAtkB1) ? n((await evalWithParser(M.spellAtkB1, attacker, t.actor, "number", M.domain))?.value,0) : 0;
          const atkF2 = !isDice(M.spellAtkB2) ? n((await evalWithParser(M.spellAtkB2, attacker, t.actor, "number", M.domain))?.value,0) : 0;
          const modDex = n(attacker.system?.mod_dexterity,0);
          const atkElem = n(attacker.system?.player_attack_bonus?.[chosenKey],0);

          atkBonusSum = modDex + atkElem + atkF1 + atkF2;

          const dmgF1 = !isDice(M.spellDmgB1) ? n((await evalWithParser(M.spellDmgB1, attacker, t.actor, "number", M.domain))?.value,0) : 0;
          const dmgF2 = !isDice(M.spellDmgB2) ? n((await evalWithParser(M.spellDmgB2, attacker, t.actor, "number", M.domain))?.value,0) : 0;
          const modArc = n(attacker.system?.mod_arcana,0);
          const dmgElem = n(attacker.system?.player_damage_bonus?.[chosenKey],0);
          dmgBonusSum = modArc + dmgElem + dmgF1 + dmgF2;




          // >>> CRIT/MUTIL (três primeiros dados)
const first3 = atkRoll.terms
  .filter(tt => DieTerm && tt instanceof DieTerm)
  .flatMap(tt => tt.results)
  .slice(0, 3)
  .map(r => r.result);

const c6 = first3.filter(x => x === 6).length;
const c1 = first3.filter(x => x === 1).length;

isCrit = false; 
isMutil = false;

if (c6 === 3) { 
  isCrit = true; 
  isMutil = true; 
  resultLabel = "MUTILAÇÃO!"; 
}
else if (c6 === 2) {
  const third = first3.find(x => x !== 6);
  const descLim = n(M.descNumber, 0); // se 0 → não promove mutilação
  if (third != null && descLim > 0 && third >= descLim) { 
    isCrit = true; 
    isMutil = true; 
    resultLabel = "MUTILAÇÃO!"; 
  } else { 
    isCrit = true; 
    resultLabel = "Crítico"; 
  }
}
else if (c1 === 3) { 
  resultLabel = "Catastrófica"; 
}
else if (c1 === 2) { 
  resultLabel = "Crítica"; 
}
else { 
  resultLabel = "Comum"; 
}

console.log("[MAGIC][CRIT]", { dice: first3, descNumber: M.descNumber, isCrit, isMutil, resultLabel });


          const ref = n(targetSystem.player_reflex,10);
          atkDiceTotal = atkRoll.total; atkTotal = atkDiceTotal + atkBonusSum;
          hit = atkTotal > ref;

          // damage (if hit)
let finalDamage = 0, dmgRoll=null, baseShown="0";
let armorLine = null;
let elemResistLine = null;

if (hit) {
  const dmgRes = await evalWithParser(M.damageFormula, attacker, t.actor, "roll", M.domain);
  dmgRoll = dmgRes?.roll ?? null;
  const baseVal = n(dmgRes?.value, 0);

  // críticos / mutilação
  const critMult = isMutil ? 3 : (isCrit ? 2 : 1);
  const baseCritVal = baseVal * critMult;
  baseShown = `${critMult>1 ? `${baseVal} × ${critMult} = ${baseCritVal}` : baseVal}`;

  // bônus fixos + resistência/fragilidade elemental
  const resist = n(targetSystem?.resistances?.[chosenKey], 0);
  if (resist !== 0) {
    const lbl = resist > 0 ? `Resistência (${elemPT}):` : `Fraqueza (${elemPT}):`;
    elemResistLine = { text: lbl, value: (resist>0 ? `-${resist}` : `+${Math.abs(resist)}`) };
  }

  const bruto = Math.max(0, baseCritVal + dmgBonusSum - resist);

  // regra PROT — sem subtrair armadura
  let prot = n(targetSystem.mod_protection, 0);
  let shieldBroken = false;
  if (M.damageTypeMagic === "piercing" && armorIsMetal(targetSystem) === false) { prot = Math.floor(prot/2); shieldBroken = true; }
  if (M.damageTypeMagic === "ironbreaker") { prot = Math.floor(prot/2); shieldBroken = true; }

  const passou = bruto > prot;
  finalDamage = passou ? bruto : Math.max(0, Math.floor(bruto / 2));
  // clamp apenas VISUAL (não mexe no número real)
  const finalDamageDisplay = finalDamage <= 0 ? 1 : finalDamage;


  armorLine = passou
    ? { text: "A armadura foi transpassada." }
    : { text: "A armadura mitigou o dano.", value: `(${bruto} / 2)` };

const dmgTray = diceObjs(dmgRoll).map(d => `
  <div class="dice-icon ${elemColorClass} ${elemColorClassPT} ${elemColorClassPTNoAccent}">
    <div class="dice-bg" style="background-image:url('systems/tm/styles/assets/dices/d${d.faces}.svg');"></div>
    <div class="dice-number">${d.result}</div>
  </div>`).join("");



  const details = detailsBlockHTML({
    ref: n(targetSystem.player_reflex,10),
    protValue: prot,
    shieldBroken,
    atkRoll, atkDiceTotal, atkBonusSum, atkTotal,
    dmgRollTray: dmgTray,
    dmgBaseShown: baseShown,
    dmgBonusSum,
    armorLine,
    elemResistLine,
    dmgFinal: finalDamageDisplay
  });

            const outcomeHTML = `
              <div class="tm-outcome">
                <div class="tm-row ${hit ? "tm-success" : "tm-failure"}" style="display:flex;align-items:center;justify-content:center;gap:8px;">
                  <span style="font-weight:bold; ${hit ? 'color:#33cc33' : 'color:#cc3333'}">${hit ? "Sucesso" : "Falha"}</span>
                  <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:white;text-shadow:1px 1px 2px black;font-weight:bold;">${atkTotal}</div>
                  <span style="font-weight:bold;color:${resultLabel==="MUTILAÇÃO!"?"#ff5555":(resultLabel.includes("Crít")?"#33cc33":"#999")}">${resultLabel}</span>
                </div>
                ${hit ? `<div class="tm-row tm-damage" style="gap:8px;justify-content:center;"><span style="font-weight:bold;">Dano</span><div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:white;text-shadow:1px 1px 2px black;font-weight:bold;">${finalDamageDisplay}</div><span style="text-transform:capitalize;">${elemPT}</span></div>` : ""}
                ${details}
              </div>`;

            const msg = `
              <div class="chat-roll" style="font-family:var(--font-primary);font-size:1.1em;">
                ${headerTagsHtml(M, [
                  `<span class="tag">${M.damageFormula} ${UI.elementsPT[chosenKey] ?? chosenKey}</span>`,
                  `<span class="tag">🎯 ${t.name}</span>`
                ])}
                <div class="chat-description" style="font-size:13px;color:var(--color-text-light);margin-bottom:8px;">${M.desc}</div>
                ${outcomeHTML}
              </div>`;

            await ChatMessage.create({
              user: game.user.id,
              speaker: ChatMessage.getSpeaker({ actor: attacker }),
              flavor: msg,
              rolls: [atkRoll, dmgRoll].filter(r => r instanceof Roll)
            });

          } else {
            // miss message
            const details = detailsBlockHTML({
              ref: n(targetSystem.player_reflex,10),
              protValue: n(targetSystem.mod_protection,0),
              shieldBroken: false,
              atkRoll, atkDiceTotal, atkBonusSum, atkTotal,
              dmgRollTray: "", dmgBaseShown:"0", dmgBonusSum:0, dmgFinal:0
            });
            const outcomeHTML = `
              <div class="tm-outcome">
                <div class="tm-row tm-failure" style="display:flex;align-items:center;justify-content:center;gap:8px;">
                  <span style="font-weight:bold;color:#cc3333">Falha</span>
                  <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:white;text-shadow:1px 1px 2px black;font-weight:bold;">${atkTotal}</div>
                  <span style="font-weight:bold;color:#999">${resultLabel}</span>
                </div>
                ${details}
              </div>`;
            const msg = `
              <div class="chat-roll" style="font-family:var(--font-primary);font-size:1.1em;">
                ${headerTagsHtml(M, [
                  `<span class="tag">${M.damageFormula} ${UI.elementsPT[chosenKey] ?? chosenKey}</span>`,
                  `<span class="tag">🎯 ${t.name}</span>`
                ])}
                <div class="chat-description" style="font-size:13px;color:var(--color-text-light);margin-bottom:8px;">${M.desc}</div>
                ${outcomeHTML}
              </div>`;
            await ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: attacker }), flavor: msg, rolls: [atkRoll] });
          }
        }
      }
    }
    registerChatToggleOnce();
    console.log("[MAGIC] ok");
  } catch (e) {
    console.error("[MAGIC] error", e);
    ui.notifications.error("Falha ao processar o ataque mágico.");
  }
}
export const MasteryMagicAttackRoll = { roll: rollMagicMastery };

// ------------------------------ 3) Melee Attack ------------------------------
async function rollMasteryAttack({ attacker, target, mastery, hand = "right", forcedDice }) {
  try {
    if (!attacker || !target) return ui.notifications.warn("Selecione um atacante e um alvo.");
    const targetActor = target.actor; if (!targetActor) return ui.notifications.warn("O alvo não possui ficha de ator.");

    const M = normalizeMastery(mastery);
    if (!M.hasRoll) {
      const fake = `
        <div class="chat-roll" style="font-family: var(--font-primary); font-size: 1.1em;">
          ${headerTagsHtml(M, (M.tags || []).map(t => `<span class="tag">${t}</span>`))}
          <div class="chat-description" style="font-size:13px;color:var(--color-text-light);margin-bottom:8px;">${M.desc}</div>
        </div>`;
      await ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: attacker }), flavor: fake });
      return;
    }

    // Equipped weapon / unarmed
    const slotKey = hand === "right" ? "slot_weapon1" : "slot_weapon2";
    const equipped = attacker.system?.gearSlots?.[slotKey];
    const item = equipped ? attacker.items.get(equipped.itemId) : null;
    const W = normalizeItemWeapon(item, !item);

    // size / extras
    const size = item?.system?.weapon_subtypes_3 || null;

    // weapon_extra => efeitos contra alvo
    const extraEffects = {};
    if (mastery.weapon_extra) {
      const lines = mastery.weapon_extra.split(";").map(s => s.trim()).filter(Boolean);
      for (const line of lines) {
        const m = line.match(/^target\.(\w+)\s*=\s*([-+]?\s*\d+)\s*(?:\/\s*(NDp|NDi|ND|NPp|NPi|NP))?$/i);
        if (!m) continue;
        const key = m[1];
        let val = parseInt(m[2], 10);
        const scale = (m[3] || "").toUpperCase();
        const ND = M.mastery_nd ?? 1;
        const NP = attacker.system?.player_level ?? 1;
        if (scale === "ND")  val *= ND;
        else if (scale === "NDP") val *= Math.floor(ND/2);
        else if (scale === "NDI") val *= Math.floor((ND+1)/2);
        else if (scale === "NP")  val *= NP;
        else if (scale === "NPP") val *= Math.floor(NP/2);
        else if (scale === "NPI") val *= Math.floor((NP+1)/2);
        extraEffects[key] = (extraEffects[key] ?? 0) + val;
      }
    }

    const autoHit = M.autoHit === true;

    // ----- ATTACK roll (v13: NUNCA usar {async:true})
    const baseDice = n(attacker.system?.player_action_dice, 3);
    const extraDice = n(attacker.system?.player_extra_dice?.[W.subtype], 0)
                    + n(attacker.system?.player_extra_dice?.[W.damageType], 0)
                    + n(attacker.system?.player_attack_bonus?.[size], 0);
    const atkDice = forcedDice ?? (baseDice + extraDice);

    const atkRollBase = autoHit
      ? await (new Roll("100")).evaluate()
      : await (new Roll(`${atkDice}d6`)).evaluate();

    // pré-checagem de falha crítica
    const DieTerm = foundry?.dice?.terms?.Die;
    const preview = [];
    if (!autoHit) {
      for (const term of atkRollBase.terms) {
        if (DieTerm && term instanceof DieTerm) for (const r of term.results) preview.push(r.result);
      }
    }
    const first3Preview = preview.slice(0,3);
    const c6Prev = first3Preview.filter(v => v===6).length;
    const c1Prev = first3Preview.filter(v => v===1).length;
    let forcedMiss = !autoHit && (c1Prev >= 2);

    // aplica bônus de maestria (dados) SOMENTE se não for falha forçada
    let atkRoll = atkRollBase;
    const atkB1 = await evalWithParser(M.wAtkB1, attacker, targetActor, isDice(M.wAtkB1)?"roll":"number", M.domain);
    const atkB2 = await evalWithParser(M.wAtkB2, attacker, targetActor, isDice(M.wAtkB2)?"roll":"number", M.domain);
    if (!forcedMiss) {
      if (atkB1?.roll) { atkRoll.terms.push(...atkB1.roll.terms); atkRoll._total += atkB1.roll.total; }
      if (atkB2?.roll) { atkRoll.terms.push(...atkB2.roll.terms); atkRoll._total += atkB2.roll.total; }
    }

    const fixedAtk1 = !isDice(M.wAtkB1) ? n(atkB1?.value,0) : 0;
    const fixedAtk2 = !isDice(M.wAtkB2) ? n(atkB2?.value,0) : 0;

    const atkBonusSum =
      n(attacker.system?.mod_dexterity,0) +
      n(attacker.system?.player_attack_bonus?.[W.subtype],0) +
      n(attacker.system?.player_attack_bonus?.[W.damageType],0) +
      n(attacker.system?.player_attack_bonus?.[size],0) +
      fixedAtk1 + fixedAtk2;

    const atkDiceTotal = atkRoll.total;
    const atkTotal = autoHit ? "✔️" : (atkDiceTotal + atkBonusSum);

    // crítico / descomunal
    const atkDiceIcons = diceObjs(atkRoll);
    const first3 = atkDiceIcons.slice(0,3).map(d => d.result);
    const c6 = first3.filter(v => v===6).length;
    const c1 = first3.filter(v => v===1).length;

    let descWeapon = n(item?.system?.weapon_traits?.weapon_trait_desc, 0);
    let descMastery = n(mastery.mastery_desc, 0);
    const descFinal = (descWeapon>0 && descMastery>0) ? Math.min(descWeapon, descMastery)
                    : (descWeapon>0 ? descWeapon : descMastery);

    let critMult = 1;
    let resultLabel = autoHit ? "Automático" : "Comum";
    if (!autoHit) {
      if (c6 === 3) { critMult = 3; resultLabel = "MUTILAÇÃO!"; }
      else if (c6 === 2) {
        const third = first3.find(v => v !== 6);
        if (third != null && descFinal > 0 && third >= descFinal) { critMult = 3; resultLabel = "MUTILAÇÃO!"; }
        else { critMult = 2; resultLabel = "Crítico"; }
      } else if (c1 === 3) { forcedMiss = true; resultLabel = "Catastrófica"; }
      else if (c1 === 2) { forcedMiss = true; resultLabel = "Crítica"; }
    }

    // REF e acerto
    const refBase = n(targetActor.system?.player_reflex, 10);
    const ref = refBase + n(extraEffects?.reflex, 0);
    const hit = autoHit || (!forcedMiss && (typeof atkTotal === "number" ? (atkTotal > ref) : true));

    // ----- DAMAGE (físico)
    let baseRoll = null, baseDmg = 0;
    let masteryDmgRoll = null;
    let masteryFixedDmgBonus = 0;
    let dmgBonusSum = 0;

    let prot = n(targetActor.system?.mod_protection,0) + n(extraEffects?.prot,0);
    let shieldBroken = !!(W.traits?.weapon_trait_ironbreaker || (W.damageType==="piercing" && !armorIsMetal(targetActor.system)));
    if (shieldBroken) prot = Math.floor(prot/2);

    const resist = n(targetActor.system?.resistances?.[W.damageType],0);

    // Variáveis usadas fora do bloco para evitar ReferenceError
    let aposRes = 0;
    let passed = false;
    let finalPhysical = 0;
    let armorLine = null; // debug: linha de armadura sempre definida

    if (hit) {
      console.log("[MELEE][DANO BASE/ELM] ", {
  raw: item?.system?.weapon_damage,
  parsedBase: W.damageDice
});

      baseRoll = await (new Roll(W.damageDice)).evaluate();

      const mDmg = await evalWithParser(M.wDmgB1, attacker, targetActor, isDice(M.wDmgB1)?"roll":"number", M.domain);
      masteryDmgRoll = mDmg?.roll ?? null;
      const masteryDmgDiceVal = masteryDmgRoll ? masteryDmgRoll.total : 0;
      masteryFixedDmgBonus = !isDice(M.wDmgB1) ? n(mDmg?.value,0) : 0;

      baseDmg = baseRoll.total + masteryDmgDiceVal;

      dmgBonusSum =
        n(attacker.system?.mod_letality,0) +
        n(attacker.system?.player_damage_bonus?.[W.subtype],0) +
        n(attacker.system?.player_damage_bonus?.[W.damageType],0) +
        n(attacker.system?.player_damage_bonus?.[size],0) +
        masteryFixedDmgBonus;

      const bruto = (baseDmg * critMult) + dmgBonusSum;
      aposRes = Math.max(0, bruto - resist);
      passed = aposRes > prot;
      finalPhysical = passed ? aposRes : Math.max(0, Math.floor(aposRes/2));

    }

// ----- Elemental extra do weapon_damage: {{ +XdY(Elemento) }}
let elementalRoll = null, elementalDamage = 0;
// classes CSS para colorir os dados elementais (declare ANTES de usar)
let elementalCssClass = "";
let elementalKeyPT = ""; // ex.: "fogo", "gelo", "eletrico"...
// linhas extras para o detalhe
let elemExtraLine = null;
let elemResistLine = null;

const weaponDmgRaw = (item?.system?.weapon_damage || "").trim();
const mCustom = weaponDmgRaw.match(/^\s*(.+?)\s*\{\{\s*([+−-]?\s*\d+d\d+)\s*\(([^)]+)\)\s*\}\}\s*$/i);

if (hit && mCustom) {
  const bonusDice = mCustom[2].replace("−", "-").trim();
  elementalKeyPT = mCustom[3].trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  elementalCssClass = `dice-${elementalKeyPT}`;

  console.log("[MELEE][ELEMENTAL]", { bonusDice, elementalKeyPT, elementalCssClass });

  elementalRoll = await (new Roll(bonusDice)).evaluate();

  const map = {
    fogo: "fire", calor: "fire",
    gelo: "cold", frio: "cold",
    eletrico: "electricity", eletricidade: "electricity", raio: "electricity",
    veneno: "poison",
    acido: "acid",
    mental: "psychic",
    radiante: "radiant",
    necrotico: "necrotic",
    caotico: "chaotic"
  };
  const resK = map[elementalKeyPT] || elementalKeyPT;
  const resEle = n(targetActor.system?.resistances?.[resK], 0);
  elementalDamage = Math.max(0, (elementalRoll.total * critMult) - resEle);

  const elemCritTotal = elementalRoll.total * critMult; // valor do dado elemental após crítico
elemExtraLine = { text: `Dano extra (${elementalKeyPT}):`, value: `${elemCritTotal}` };

if (resEle !== 0) {
  const label = resEle > 0
    ? `Resistência (${elementalKeyPT}):`
    : `Fraqueza (${elementalKeyPT}):`;

  elemResistLine = {
    text: label,
    value: resEle > 0 ? `-${resEle}` : `+${Math.abs(resEle)}`
  };
  console.log("[MELEE][ELEM RES]", { elementalKeyPT, resEle, label, shown: elemResistLine.value });
}


}

const finalDamage = hit ? (finalPhysical + elementalDamage) : 0;
// clamp apenas VISUAL (não mexe no número real)
const finalDamageDisplay = finalDamage <= 0 ? 1 : finalDamage;


// ----- DETALHES / DICE TRAY -----
const icon = (d, extraClass = "") => `
  <div class="dice-icon ${extraClass}">
    <div class="dice-bg" style="background-image:url('systems/tm/styles/assets/dices/d${d.faces}.svg');"></div>
    <div class="dice-number">${d.result}</div>
  </div>
`;

const trayParts = [];
diceObjs(baseRoll).forEach(d => trayParts.push(icon(d)));                              // físico
if (masteryDmgRoll) diceObjs(masteryDmgRoll).forEach(d => trayParts.push(icon(d)));   // bônus da maestria
if (elementalRoll) diceObjs(elementalRoll).forEach(d => trayParts.push(icon(d, elementalCssClass))); // elemental colorido

const dmgTray = trayParts.join("");

// debug rápido do tray e classe do elemental
console.log("[MELEE][TRAY]", { elementalCssClass, hasElemental: !!elementalRoll, trayLen: trayParts.length });

const baseShown = (hit && critMult > 1)
  ? `${baseDmg} × ${critMult} = ${baseDmg * critMult}`
  : `${baseDmg}`;

const resistLine = (resist !== 0)
  ? {
      text: `Resistência (${UI.dmgPT[W.damageType] ?? W.damageType}):`,
      value: (resist > 0 ? `-${resist}` : `+${Math.abs(resist)}`)
    }
  : null;

armorLine = hit
  ? (passed
      ? { text: "A armadura foi transpassada." }
      : { text: "A armadura mitigou o dano.", value: `(${aposRes} / 2)` })
  : { text: "Sem dano (ataque falhou).", value: "" };


const detailsHTML = detailsBlockHTML({
  ref, protValue: prot, shieldBroken,
  atkRoll, atkDiceTotal, atkBonusSum,
  atkTotal: (typeof atkTotal === "number" ? atkTotal : "✔️"),
  dmgRollTray: dmgTray,
  dmgBaseShown: baseShown,
  dmgBonusSum,
  resistLine,     // resistência física (se houver)
  armorLine,      // armadura
  elemExtraLine,  // NOVO
  elemResistLine, // NOVO
  dmgFinal: finalDamageDisplay
});



    const outcomeHTML = `
      <div class="tm-outcome">
        <div class="tm-row ${hit ? "tm-success" : "tm-failure"}" style="display:flex;align-items:center;justify-content:center;gap:8px;">
          <span style="font-weight:bold; ${hit ? 'color:#33cc33' : 'color:#cc3333'}">${hit ? "Sucesso" : "Falha"}</span>
          <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:white;text-shadow:1px 1px 2px black;font-weight:bold;">
            ${typeof atkTotal === "number" ? atkTotal : "✔️"}
          </div>
          <span style="font-weight:bold;">${resultLabel}</span>
        </div>
        ${hit ? `
          <div class="tm-row tm-damage" style="gap:8px;justify-content:center;">
            <span style="font-weight:bold;">Dano</span>
            <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:white;text-shadow:1px 1px 2px black;font-weight:bold;">${finalDamageDisplay}</div>
            <span style="text-transform:lowercase;">${UI.dmgPT[W.damageType] ?? W.damageType}</span>
          </div>` : ""}
        ${detailsHTML}
      </div>`;

    const headerMastery = { ...M, rangeM: W.rangeM ?? M.rangeM };

    const damageTags = (() => {
      const raw = item?.system?.weapon_damage || W.damageDice;
      const m = raw.match(/^\s*(.+?)\s*\{\{\s*([+−-]?\s*\d+d\d+)\s*\(([^)]+)\)\s*\}\}\s*$/i);
      const tags = [];
      if (m) {
        tags.push(`<span class="tag">${m[1].trim()} ${UI.dmgPT[W.damageType] ?? W.damageType}</span>`);
        tags.push(`<span class="tag">${m[2].replace("−","-").replace("+","").trim()} ${m[3].trim().toLowerCase()}</span>`);
      } else {
        tags.push(`<span class="tag">${W.damageDice} ${UI.dmgPT[W.damageType] ?? W.damageType}</span>`);
      }
      return tags.join(" ");
    })();

    const msgContent = `
      <div class="chat-roll" style="font-family:var(--font-primary);font-size:1.1em;">
        ${headerTagsHtml(headerMastery, [
          damageTags,
          `<span class="tag">🎯 ${target.name}</span>`
        ])}
        <div class="chat-description" style="font-size:13px;color:var(--color-text-light);margin-bottom:8px;">${M.desc}</div>
        ${outcomeHTML}
      </div>`;

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: attacker }),
      flavor: msgContent,
      rolls: [atkRoll, baseRoll, masteryDmgRoll, elementalRoll].filter(r => r instanceof Roll)
    });

    registerChatToggleOnce();
    console.log("[MELEE] ok", { atkTotal, finalDamage });

  } catch (e) {
    console.error("[MELEE] error", e);
    ui.notifications.error("Falha ao processar o ataque corpo-a-corpo.");
  }
}
export const MasteryMeleeAttackRoll = { roll: rollMasteryAttack };
