import { DomainsDB } from "./data/domains-index.js";
const DOMAINS = DomainsDB;


export class DomainsPanel {
  static render(container, actor) {
    const panel = container.find("#domain-panel");
    if (!panel.length) return;

    const selectHtml = Object.keys(DOMAINS).map(domainKey => {
  const label = domainKey.charAt(0).toUpperCase() + domainKey.slice(1);
  return `<option value="${domainKey}">Domínio: ${label}</option>`;
}).join("");
const previousDomain = container.find("#domain-select").val();
const selectedDomain = previousDomain || actor.getFlag("tm", "activeDomain") || "hierophant";



panel.html(`
  <select id="domain-select" style="margin-bottom: 10px;">
    ${Object.keys(DOMAINS).map(domainKey => {
      const label = domainKey.charAt(0).toUpperCase() + domainKey.slice(1);
      const selected = domainKey === selectedDomain ? "selected" : "";
      return `<option value="${domainKey}" ${selected}>Domínio: ${label}</option>`;
    }).join("")}
  </select>
  <div id="domain-tree"></div>
`);
panel.find("#domain-select").val(selectedDomain);
this.renderTree(selectedDomain, panel, actor);



panel.find("#domain-select").on("change", async function () {
  await actor.setFlag("tm", "activeDomain", this.value);
  DomainsPanel.renderTree(this.value, panel, actor);
});

  }

  static renderTree(domainKey, panel, actor) {
    actor.update({}); // força o update para recalcular os pontos
    actor = game.actors.get(actor.id); // agora sim pega os dados atualizados

    const list = DOMAINS[domainKey];
    const tree = panel.find("#domain-tree");
    if (!list || !actor) return tree.html("<p>Erro ao carregar domínio.</p>");

    tree.empty();

    const masteryTrees = actor.system.masteryTrees?.[domainKey] ?? {};
    const actorLevel = actor.system.player_level ?? 1;
    const spent = actor.system.masteryPoints?.spent ?? 0;
    const total = actorLevel * 3;
    const remaining = total - spent;

    const header = document.createElement("div");
    header.style.marginBottom = "10px";
    header.style.fontWeight = "bold";
    header.style.fontSize = "14px";
    header.textContent = `PONTOS DE MAESTRIA ${remaining}/${total}`;
    tree[0].appendChild(header);

    const grouped = {};
    for (let m of list) {
      const nd = m.mastery_nd ?? 1;
      if (!grouped[nd]) grouped[nd] = [];
      grouped[nd].push(m);
    }

    for (let nd = 1; nd <= 7; nd++) {
      const group = grouped[nd] ?? [];
      const ndKey = `nd${nd}`;
      tree[0].appendChild(Object.assign(document.createElement("h3"), { textContent: `ND${nd}` }));

      const row = document.createElement("div");
      row.classList.add("maestry-row");

      const evoRow = document.createElement("div");
      evoRow.classList.add("maestry-row");

      for (let mastery of group) {
        const div = document.createElement("div");
        div.classList.add("maestry-display");
        div.dataset.masteryId = mastery.id;
        div.dataset.domain = domainKey;

        const entryList = masteryTrees[ndKey] ?? [];
        const acquiredEntry = entryList.find(e => e.id === mastery.id);
        const isAcquired = !!acquiredEntry;
        const evolved = acquiredEntry?.evolved ?? null;
        const prevAcquired = nd === 1 || (masteryTrees[`nd${nd - 1}`]?.length > 0);
        const canUnlock = actorLevel >= nd && prevAcquired && !isAcquired;
        const cost = mastery.maestry_points_value ?? 1;

        if (isAcquired) div.classList.add("active");
        else if (!canUnlock) div.classList.add("locked");

        const img = document.createElement("img");
        img.src = mastery.mastery_img;
        img.width = 80;
        img.height = 80;
        img.alt = mastery.mastery_name;
        img.title = `🪙 ${cost}`;
        div.appendChild(img);

        div.addEventListener("mouseenter", (e) => {
          game.tm?.CardTooltip?.show?.({
            name: mastery.mastery_name,
            description: mastery.mastery_description,
            img: mastery.mastery_img,
          }, e);
        });
        div.addEventListener("mouseleave", () => game.tm?.CardTooltip?.close?.());

        div.addEventListener("click", async () => {
          const newTrees = foundry.utils.deepClone(actor.system.masteryTrees ?? {});
          if (!newTrees[domainKey]) newTrees[domainKey] = {};
          if (!newTrees[domainKey][ndKey]) newTrees[domainKey][ndKey] = [];

          const existing = newTrees[domainKey][ndKey].find(e => e.id === mastery.id);

          if (existing) {
            newTrees[domainKey][ndKey] = newTrees[domainKey][ndKey].filter(e => e.id !== mastery.id);
            await actor.update({ "system.masteryTrees": newTrees });

try {
  if (mastery.mastery_type === "passive") {
    await game.tm.MasteryPersistent.deactivate(actor, mastery.id);
    console.log(`[Passive][Remove] ${mastery.id}`);
  }
} catch (err) {
  console.error("[Passive][Remove] erro:", err);
}



            console.log(`🗑️ Maestria removida: ${mastery.id}`);
            DomainsPanel.renderTree(domainKey, panel, actor);
            return;
          }

          if (!canUnlock) return ui.notifications.warn("Você não pode desbloquear esta maestria.");
          if (remaining < cost) return ui.notifications.warn("Pontos de maestria insuficientes.");

          newTrees[domainKey][ndKey].push({ id: mastery.id, acquired: true, evolved: null });

          const updateData = {
            "system.masteryTrees": newTrees
          };

          if (nd > (actor.system[`player_domain_${domainKey}_level`] ?? 0)) {
            updateData[`system.player_domain_${domainKey}_level`] = nd;
          }

          await actor.update(updateData);

try {
  if (mastery.mastery_type === "passive") {
    await game.tm.MasteryPersistent.activate(actor, mastery);
    console.log(`[Passive][Acquire] ${mastery.id}`);
  }
} catch (err) {
  console.error("[Passive][Acquire] erro:", err);
}


          console.log(`🧠 Maestria adquirida: ${mastery.id}`);
          DomainsPanel.renderTree(domainKey, panel, actor);
        });

        row.appendChild(div);

        // 🔁 Evoluções
        if (mastery.evolution_a || mastery.evolution_b) {
          for (const key of ["a", "b"]) {
            const evo = mastery[`evolution_${key}`];
            if (!evo) continue;

            const evoDiv = document.createElement("div");
            evoDiv.classList.add("maestry-display", "evolution");
            evoDiv.dataset.masteryId = evo.id;
            evoDiv.dataset.domain = domainKey;

            if (evolved === key.toUpperCase()) evoDiv.classList.add("active");

            const evoImg = document.createElement("img");
            evoImg.src = evo.mastery_img;
            evoImg.width = 80;
            evoImg.height = 80;
            evoImg.alt = evo.mastery_name;
            evoImg.title = `🪙 2`;
            evoDiv.appendChild(evoImg);

            evoDiv.addEventListener("mouseenter", (e) => {
              game.tm?.CardTooltip?.show?.({
                name: evo.mastery_name,
                description: evo.mastery_description,
                img: evo.mastery_img,
              }, e);
            });

            evoDiv.addEventListener("mouseleave", () => game.tm?.CardTooltip?.close?.());

            evoDiv.addEventListener("click", async () => {
              const newTrees = foundry.utils.deepClone(actor.system.masteryTrees ?? {});
              const entry = newTrees[domainKey][ndKey].find(e => e.id === mastery.id);
              if (!entry) return;

              const selected = key.toUpperCase();
              const wasEvolved = !!entry.evolved;
              const isSame = entry.evolved === selected;

              if (isSame) {
                entry.evolved = null;
                await actor.update({ "system.masteryTrees": newTrees });
                console.log(`↩️ Evolução removida: ${selected}`);
                DomainsPanel.renderTree(domainKey, panel, actor);
                return;
              }

              const evoCost = evo.maestry_points_value ?? 2;

              await actor.update({});
              const freshActor = game.actors.get(actor.id);
              const currentSpent = freshActor.system.masteryPoints?.spent ?? 0;
              const currentTotal = (freshActor.system.player_level ?? 1) * 3;
              const currentRemaining = currentTotal - currentSpent;

              if (!wasEvolved && currentRemaining < evoCost) {
                ui.notifications.warn("Pontos de maestria insuficientes.");
                return;
              }

              entry.evolved = selected;

              const updateData = {
                "system.masteryTrees": newTrees
              };

              if (!wasEvolved) {
                updateData["system.masteryPoints.spent"] = currentSpent + evoCost;
              }

              await actor.update(updateData);
              console.log(`🌟 Evolução aplicada: ${mastery.id} → ${selected}`);
              DomainsPanel.renderTree(domainKey, panel, actor);
            });

            evoRow.appendChild(evoDiv);
          }
        }
      }

      tree[0].appendChild(row);
      tree[0].appendChild(evoRow);
    }
  }
}
