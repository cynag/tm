export class CardTooltip {
  static tooltip = null;
  static hoverTimeout = null;

  static show(card, event) {
    clearTimeout(this.hoverTimeout);

    this.hoverTimeout = setTimeout(() => {
      this.close();

      const tooltip = document.createElement("div");
      tooltip.classList.add("tm-tooltip", "card-tooltip");

      const ATTR_MAP = {
  LETALITY: "LET",
  DEXTERITY: "DES",
  IMPULSE: "IMP",
  ARCANA: "ARC",
  ERUDITION: "ERU",
  VIRTUE: "VIR"
};

const toLabel = (code) => {
  if (!code) return "";
  const short = ATTR_MAP[code.toUpperCase()] || code.toUpperCase();
  const key = `TM.Attr${short}`;
  const localized = game.i18n.localize(key);
  return localized !== key ? localized : short;
};


      const attr1 = card.buff1 ? game.i18n.format("TM.Tooltip.Buff1", { attr: toLabel(card.buff1) }) : "";
      const attr2 = card.buff2 ? game.i18n.format("TM.Tooltip.Buff2", { attr: toLabel(card.buff2) }) : "";
      const hpLine = card.hp ? game.i18n.format("TM.Tooltip.HP", { hp: card.hp }) : "";

      tooltip.innerHTML = `
        ${attr1 ? `<div class="line">${attr1}</div>` : ""}
        ${attr2 ? `<div class="line">${attr2}</div>` : ""}
        ${hpLine ? `<div class="line">${hpLine}</div>` : ""}
      `;

      document.body.appendChild(tooltip);
      this.tooltip = tooltip;

      // Posição do tooltip
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      tooltip.style.left = `${mouseX - tooltip.offsetWidth - 12}px`;
      tooltip.style.top = `${mouseY}px`;
    }, 300);
  }

  static close() {
    clearTimeout(this.hoverTimeout);
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }
}
