export class ItemTooltip {
  static delay = 500;
  static timeout = null;
  static tooltipEl = null;

  static show(item, event) {
    if (!item || game.tm?.GridPickup?.pickupData) return;

    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.hide();

      const tooltip = document.createElement("div");
      tooltip.id = "item-tooltip";
      tooltip.className = "item-tooltip";
      tooltip.style.position = "fixed";
      tooltip.style.pointerEvents = "none";
      tooltip.style.zIndex = "99999";
      tooltip.style.maxWidth = "300px";
      tooltip.style.padding = "10px";
      tooltip.style.background = "#1e1e1e";
      tooltip.style.border = "1px solid #888";
      tooltip.style.color = "#ddd";
      tooltip.style.fontSize = "12px";
      tooltip.style.boxShadow = "0 0 8px rgba(0,0,0,0.5)";

const type = item.system.category || item.system.gear_type || item.type;
const subtype = item.system.subtype ?? "";
const typeLine = subtype ? `${type}, ${subtype}` : type;
const rarity = item.system.rarity ?? "common";
const colorMap = {
  common: "#ccc",
  uncommon: "#4da6ff",
  rare: "#6fcf97",
  epic: "#ffa94d"
};
const nameColor = colorMap[rarity] || "#ccc";


      tooltip.innerHTML = `
  <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: ${nameColor};">
    ${item.name}
  </div>
  <div style="font-size: 11px; color: #aaa; margin-bottom: 8px;">
    ${typeLine}
  </div>
  <div style="font-size: 12px; color: #ccc; margin-bottom: 8px; text-align: justify;">
  ${item.system.description ?? ""}
</div>

  <div style="font-size: 12px; color: #ffd700; display: flex; align-items: center; gap: 4px;">
    <i class="fas fa-coins"></i> ${item.system.value ?? 0}
  </div>
`;


      document.body.appendChild(tooltip);
      this.tooltipEl = tooltip;

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      tooltip.style.left = `${mouseX - tooltip.offsetWidth - 12}px`;
      tooltip.style.top = `${mouseY - 20}px`;
    }, this.delay);
  }

  static hide() {
    clearTimeout(this.timeout);
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }
}
