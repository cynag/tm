import { templateMelee } from "./data/template-melee-db.js";
import { templateMagic } from "./data/template-magic-db.js";

const DOMAINS = {
  template_melee: templateMelee,
  template_magic: templateMagic
};

export class DomainsPanel {
  static render(container, actor) {
    const panel = container.find("#domain-panel");
    if (!panel.length) return;

    const selectHTML = `
      <select id="domain-select" style="margin-bottom: 10px;">
        <option value="template_melee">Domínio: Corpo</option>
        <option value="template_magic">Domínio: Magia</option>
      </select>
      <div id="domain-tree"></div>
    `;

    panel.html(selectHTML);
    this.renderTree("template_melee", panel, actor);

    panel.find("#domain-select").on("change", function () {
      const selected = this.value;
      console.log("📘 Domínio selecionado:", selected);
      DomainsPanel.renderTree(selected, panel, actor);
    });
  }

  static renderTree(domainKey, panel, actor) {
    const list = DOMAINS[domainKey];
    const tree = panel.find("#domain-tree");

    if (!list || !actor) {
      tree.html("<p>Erro ao carregar domínio.</p>");
      return;
    }

    tree.empty();

    const row = document.createElement("div");
    row.classList.add("card-row");

    const unlocked = actor.system.masteryTrees?.[domainKey]?.ND1 ?? [];

    for (let mastery of list) {
      const div = document.createElement("div");
      div.classList.add("card-display");
      div.dataset.masteryId = mastery.id;
      div.dataset.domain = domainKey;

      if (unlocked.includes(mastery.id)) {
        div.classList.add("active");
      }

      const img = document.createElement("img");
      img.src = mastery.mastery_img;
      img.width = 80;
      img.height = 80;
      img.alt = mastery.mastery_name;
      img.title = "";

      div.addEventListener("mouseenter", (e) => {
  game.tm?.CardTooltip?.show?.({
    name: mastery.mastery_name,
    description: mastery.mastery_description,
    img: mastery.mastery_img,
  }, e);
});


      div.addEventListener("mouseleave", () => game.tm?.CardTooltip?.close?.());

      div.addEventListener("click", async () => {
  const trees = foundry.utils.deepClone(actor.system.masteryTrees ?? {});
  const level = "1"; // nivel do domínio, como string simples

  if (!trees[domainKey]) trees[domainKey] = {};
  if (!trees[domainKey][level]) trees[domainKey][level] = [];

  if (trees[domainKey][level].includes(mastery.id)) {
    ui.notifications.info("Essa maestria já foi desbloqueada.");
    return;
  }

  trees[domainKey][level].push(mastery.id);
  await actor.update({ "system.masteryTrees": trees });
  console.log("✅ Maestria registrada:", mastery.id);

  div.classList.add("active");
});


      div.appendChild(img);
      row.appendChild(div);
    }

    tree[0].appendChild(row);
  }
}
