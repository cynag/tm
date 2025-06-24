import { SkillsDB } from "../talents/skills-db.js";
import { KnowledgesDB } from "../talents/knowledges-db.js";
import { TalentRollDialog } from "../ui/talent-roll-dialog.js";


const LEVELS = [
  { min: 0, name: "Desconhecido", bonus: 0 },
  { min: 1, name: "Familiar", bonus: 10 },
  { min: 2, name: "Treinado", bonus: 25 },
  { min: 4, name: "Perito", bonus: 40 },
  { min: 7, name: "Mestre", bonus: 60 },
];

function getLevel(points) {
  return [...LEVELS].reverse().find(l => points >= l.min);
}

function renderTable(title, data, type, state, sabTotal, sabSpent, actor) {
  const table = $(`
    <div class="talent-block">
      <!-- <h3>${title}</h3> -->
      <table class="talent-table">
        <!-- Cabeçalho removido -->

        <tbody></tbody>
      </table>
    </div>`);

  const tbody = table.find("tbody");

  data.forEach(entry => {
  const points = typeof state[entry.id] === "number" ? state[entry.id] : 0;
  const level = getLevel(points) || { name: "-", bonus: 0 };

  const attrValue = actor.system["player_" + entry.attribute] || 0;
  const attrBonus = attrValue * 2;
  const attrName = entry.attribute ? entry.attribute.toUpperCase() : "-";
const totalBonus = (level.bonus || 0) + attrBonus;

const row = $(`
  <div class="talent-row" data-id="${entry.id}" data-type="${type}">
    <img class="talent-icon" src="${entry.img}" width="40" height="40"/>
    <div class="talent-info">
      <div class="talent-name">${entry.name}</div>
      <div class="talent-level">${level.name}</div>
    </div>
    <div class="talent-attr">${attrName}</div>
    <div class="talent-bonus">${totalBonus}%</div>
    <div class="talent-points">${points}</div>
    <div class="talent-buttons">
      <button class="add" data-type="${type}" data-id="${entry.id}">+</button>
      <button class="sub" data-type="${type}" data-id="${entry.id}">–</button>
    </div>
  </div>
`);



  tbody.append(row);
});



  return table;
}

export class TalentPanel {
  static async render(html, actor) {
    const container = html.find("#talent-panel-container");
    if (!container.length) return;

    const sabTotal = actor.system.player_knowledge || 0;
    const sabSpent = actor.system.talents?.sabSpent || 0;
    const skills = actor.system.talents?.skills || {};
    const knowledges = actor.system.talents?.knowledges || {};

    const section = $(`<section class="talent-section"></section>`);
    //section.append(`<h2>Perícias e Conhecimentos <small>${sabSpent}/${sabTotal} SAB</small></h2>`);

    // === AQUI, passe o actor para o renderTable ===
  section.append(renderTable("Perícias", SkillsDB, "skill", skills, sabTotal, sabSpent, actor));
  section.append(`<div class="talent-separator">//--//</div>`);
  section.append(renderTable("Conhecimentos", KnowledgesDB, "knowledge", knowledges, sabTotal, sabSpent, actor));
  section.append(`<div class="talent-separator">//--//</div>`);


    // Registra listener ANTES de anexar ao container
    section.find(".talent-row").on("click", ev =>  {
  const el = ev.currentTarget;
  const type = el.dataset.type;
  const id = el.dataset.id;
  const pool = type === "skill" ? actor.system.talents.skills : actor.system.talents.knowledges;
  const points = pool?.[id] ?? 0;

  if (points <= 0) {
    ui.notifications.warn("Você não pode testar um talento não treinado.");
    return;
  }

  const db = type === "skill" ? SkillsDB : KnowledgesDB;
  const talentData = db.find(t => t.id === id);
  const attribute = talentData?.attribute || "";
  const attrValue = actor.system[`player_${attribute}`] || 0;
  const attrBonus = attrValue * 2;

 const level = getLevel(points);
if (!level) {
  ui.notifications.warn("Você não pode testar um talento não treinado.");
  return;
}


  TalentRollDialog.show({ 
    actor, 
    type, 
    id, 
    baseBonus: level.bonus + attrBonus,
  });
});



    container.empty().append(section);

    section.find("button").on("click", async ev => {
  ev.stopPropagation(); // ✅ impede que o click nos botões suba pro <td>

  const btn = ev.currentTarget;
  const type = btn.dataset.type;
  const id = btn.dataset.id;
  const action = btn.classList.contains("add") ? "add" : "sub";

  const update = foundry.utils.deepClone(actor.system.talents || {});
  update.skills = update.skills || {};
  update.knowledges = update.knowledges || {};
  update.sabSpent = update.sabSpent || 0;

  const pool = type === "skill" ? update.skills : update.knowledges;
  const current = typeof pool[id] === "number" ? pool[id] : 0;

  if (action === "add") {
    if (current >= 7 || update.sabSpent >= sabTotal) return;
    pool[id] = current + 1;
    update.sabSpent += 1;
  }

  if (action === "sub") {
    if (current <= 0) return;
    pool[id] = current - 1;
    update.sabSpent -= 1;
  }

  await actor.update({ "system.talents": update });

  const html = actor.sheet.element;
  game.tm.TalentPanel.render(html, actor);

});

  }
}


