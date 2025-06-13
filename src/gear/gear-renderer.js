// src/gear/gear-renderer.js
import { GearConstants } from "./gear-constants.js";
import { GearManager } from "./gear-manager.js";

export class GearRenderer {
  static render(container, actor) {
    if (!actor.system?.gearSlots) return;
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.classList.add("gear-wrapper");
    wrapper.style.position = "relative";
    wrapper.style.width = "800px";
    wrapper.style.height = "600px";
    wrapper.style.background = "#111";

    for (const [slotId, slotData] of Object.entries(actor.system.gearSlots)) {
      const pos = GearConstants.GEAR_SLOT_POSITIONS[slotId];
      const size = GearConstants.SLOT_LAYOUT[slotId];
      if (!pos || !size) continue;

      const slot = document.createElement("div");
      slot.classList.add("gear-slot");
      slot.dataset.slotId = slotId;
      slot.style.position = "absolute";
      slot.style.left = `${pos.x * GearConstants.SLOT_WIDTH}px`;
      slot.style.top = `${pos.y * GearConstants.SLOT_HEIGHT}px`;
      slot.style.width = `${size.w * GearConstants.SLOT_WIDTH}px`;
      slot.style.height = `${size.h * GearConstants.SLOT_HEIGHT}px`;
      slot.style.border = "1px solid #888";
      slot.style.display = "flex";
      slot.style.alignItems = "center";
      slot.style.justifyContent = "center";
      slot.style.color = "#ccc";
      slot.style.fontSize = "10px";
      slot.style.textAlign = "center";
      slot.style.overflow = "hidden";
      slot.style.background = "rgba(255,255,255,0.05)";

      const label = document.createElement("div");
      label.innerText = slotId.replace("slot_", "").toUpperCase();
      label.style.pointerEvents = "none";
      slot.appendChild(label);

      if (slotData.itemId) {
        const item = actor.items.get(slotData.itemId);
        if (item) {
          const img = document.createElement("img");
          img.src = item.img;
          img.style.position = "absolute";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.zIndex = "1";
          slot.appendChild(img);
        }
      }

      slot.addEventListener("click", () => {
        if (slotData.itemId) GearManager.unequip(actor, slotId);
      });

      wrapper.appendChild(slot);
    }

    container.appendChild(wrapper);
  }
}
