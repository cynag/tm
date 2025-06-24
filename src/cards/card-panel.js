import { CardsDB } from "./cards-db.js";

export class CardPanel {
  static #animatedLevels = new Map();

  static render(actor, container) {


    if (!actor || !container) return;
    const s = actor.system;

    container.innerHTML = "";

    for (let level = 1; level <= s.player_level; level++) {
      const titleWrapper = document.createElement("div");
titleWrapper.classList.add("card-title");

const title = document.createElement("h3");
title.innerText = `Cartas Nível ${level}`;
titleWrapper.appendChild(title);
container.appendChild(titleWrapper);

const row = document.createElement("div");
row.classList.add("card-row");


      const active = s.activeCards?.[level] ?? [];

      for (let card of CardsDB[level] || []) {
        const div = document.createElement("div");
        div.classList.add("card-display");
        div.dataset.cardId = card.id;
        div.dataset.cardLevel = level;

        const isActive = active.includes(card.id);
        const limitReached = active.length >= 3;
        const isDisabled = !isActive && limitReached;

        if (isActive) div.classList.add("active");
        if (isDisabled) div.classList.add("disabled");

        const img = document.createElement("img");
        img.src = card.img;
        img.width = 80;
        img.height = 112;
        img.alt = card.name;
        img.title = `
          ${card.name}\n\n
          ${card.buff1 || ""}\n
          ${card.buff2 || ""}\n
          ${card.hp ? `PV: +${card.hp}` : ""}\n
          ${card.description || ""}
        `.trim();

        const label = document.createElement("div");
        label.classList.add("card-name");
        label.innerText = card.name;

        div.appendChild(img);
        div.appendChild(label);
        row.appendChild(div);
      }

      container.appendChild(row);
    }

    

    // Listeners
    container.querySelectorAll(".card-display").forEach(cardEl => {
      if (cardEl.classList.contains("disabled")) return;

      cardEl.addEventListener("click", async () => {
  const cardId = cardEl.dataset.cardId;
  const level = parseInt(cardEl.dataset.cardLevel);

  const active = foundry.utils.deepClone(actor.system.activeCards?.[level] ?? []);
  const idx = active.indexOf(cardId);

  if (idx >= 0) active.splice(idx, 1);
  else if (active.length < 3) active.push(cardId);

  const updated = foundry.utils.deepClone(actor.system.activeCards ?? {});
  updated[level] = active;

  await actor.update({ "system.activeCards": updated });

// ⚠️ Resetar animação após update para permitir nova no futuro
if (game.tm?.CardPanel?.resetAnimation) {
  game.tm.CardPanel.resetAnimation(actor.id);
}

cardEl.classList.toggle("active");

});

    });

    // DEBUG: Verificar se container já tinha animado
console.log("[CardPanel] Inicializando container:", container.dataset.initialized);

if (!this.#animatedLevels.has(actor.id)) {
  this.#animatedLevels.set(actor.id, new Set());
}
const animatedSet = this.#animatedLevels.get(actor.id);



container.querySelectorAll(".card-row").forEach(row => {
  const level = parseInt(row.querySelector(".card-display")?.dataset.cardLevel);

  if (!animatedSet.has(level)) {
  row.setAttribute("data-init", "true");
  row.querySelectorAll(".card-display").forEach(div => {

  });
  animatedSet.add(level);
  console.log(`[CardPanel] Animação aplicada no nível ${level}`);
} else {
  row.querySelectorAll(".card-display").forEach(div => {
    div.classList.remove("animated");
  });
  console.log(`[CardPanel] Nível ${level} já animado — pulado`);
}

});





  }

  static resetAnimation(actorId) {
  this.#animatedLevels.set(actorId, new Set());
}
}
