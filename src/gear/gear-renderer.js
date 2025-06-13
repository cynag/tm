// src/gear/gear-renderer.js
import { GearConstants } from "./gear-constants.js";
import { GearManager } from "./gear-manager.js";

export class GearRenderer {
  static render(container, actor) {
    if (!actor.system?.gearSlots) return;
    if (!container) {
      console.warn("[GearRenderer] ⚠️ Container #gear-slots não encontrado.");
      return;
    }

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.classList.add("gear-wrapper");
    wrapper.style.position = "relative";
    wrapper.style.width = "800px";
    wrapper.style.height = "600px";
    wrapper.style.background = "#111";

    for (const [slotId] of Object.entries(actor.system.gearSlots)) {
      const slotData = actor.system.gearSlots[slotId];
      const pos = GearConstants.GEAR_SLOT_POSITIONS[slotId];
      const size = GearConstants.SLOT_LAYOUT[slotId];
      if (!pos || !size) continue;

      const baseSlot = document.createElement("div");
      baseSlot.classList.add("gear-slot");
      baseSlot.dataset.slotId = slotId;
      baseSlot.style.position = "absolute";
      baseSlot.style.left = `${pos.x * GearConstants.SLOT_WIDTH}px`;
      baseSlot.style.top = `${pos.y * GearConstants.SLOT_HEIGHT}px`;
      baseSlot.style.width = `${size.w * GearConstants.SLOT_WIDTH}px`;
      baseSlot.style.height = `${size.h * GearConstants.SLOT_HEIGHT}px`;
      baseSlot.style.border = "1px solid #888";
      baseSlot.style.display = "flex";
      baseSlot.style.alignItems = "center";
      baseSlot.style.justifyContent = "center";
      baseSlot.style.color = "#ccc";
      baseSlot.style.fontSize = "10px";
      baseSlot.style.textAlign = "center";
      baseSlot.style.overflow = "hidden";
      baseSlot.style.background = "rgba(255,255,255,0.05)";

      const label = document.createElement("div");
      label.innerText = slotId.replace("slot_", "").toUpperCase();
      label.style.pointerEvents = "none";
      baseSlot.appendChild(label);

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
          baseSlot.appendChild(img);
        }
      }

      const slot = baseSlot.cloneNode(true); // remove qualquer listener antigo

      slot.addEventListener("mousedown", async (e) => {
        e.preventDefault();
        const pickup = game.tm.GridPickup.pickupData;
        const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
        const gearContainer = app?.element.find("#gear-slots")[0];
        const gridContainer = app?.element.find("#grid-inventory")[0];

        if (e.button === 0 && pickup) {
          const item = game.actors.get(pickup.actorId)?.items.get(pickup.itemId);
          if (!item) return;

          const valid = game.tm.GearUtils.isValidForSlot(item, slotId);
          if (!valid) {
            ui.notifications.warn("Este item não pode ser equipado nesse slot.");
            return;
          }

          await game.tm.GearManager.equipItem(actor, item, slotId);
          game.tm.GridPickup.pickupData = null;
          game.tm.GridPickup._removePreview();
          game.tm.GridPickup._removeOverlay();
          game.tm.GridPickup._removeListeners();

          if (gearContainer) game.tm.GearRenderer.render(gearContainer, actor);
          if (gridContainer) {
            const grid = game.tm.GridUtils.createVirtualGrid(actor);
            game.tm.GridRenderer.renderGrid(gridContainer, grid);
          }
          return;
        }

        if (e.button === 0 && !pickup) {
          const current = actor.system.gearSlots[slotId]?.itemId;
          if (!current) return;

          const item = actor.items.get(current);
          if (!item) return;

          await game.tm.GearManager.unequipItem(actor, slotId);
          game.tm.GridPickup.start(actor, item, false, null, e);

          if (gearContainer) game.tm.GearRenderer.render(gearContainer, actor);
          if (gridContainer) {
            const grid = game.tm.GridUtils.createVirtualGrid(actor);
            game.tm.GridRenderer.renderGrid(gridContainer, grid);
          }
          return;
        }

        if (e.button === 2) {
          const current = actor.system.gearSlots[slotId]?.itemId;
          if (!current) return;

          const item = actor.items.get(current);
          if (!item) return;

          await game.tm.GearManager.unequipItem(actor, slotId);
          await game.tm.GridAutoPosition.placeNewItem(actor, item);

          if (gearContainer) game.tm.GearRenderer.render(gearContainer, actor);
          if (gridContainer) {
            const grid = game.tm.GridUtils.createVirtualGrid(actor);
            game.tm.GridRenderer.renderGrid(gridContainer, grid);
          }
        }
      });

      wrapper.appendChild(slot);
    }

    if (!this._renderedActors) this._renderedActors = new Set();
    this._renderedActors.add(actor.id);
    setTimeout(() => {
      this._renderedActors.delete(actor.id);
    }, 100);

    container.appendChild(wrapper);
  }
}
