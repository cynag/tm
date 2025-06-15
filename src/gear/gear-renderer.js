// src/gear/gear-renderer.js
import { GearConstants } from "./gear-constants.js";
import { GearManager } from "./gear-manager.js";

export class GearRenderer {
  static render(container, actor) {
    if (!actor.system?.gearSlots || !container) return;

    container.innerHTML = "";

    // Limpa overlays visuais antigos
const slotsOld = container.querySelectorAll(".gear-slot");
slotsOld.forEach(slot => slot.removeAttribute("data-gear-overlay"));

    const wrapper = document.createElement("div");
    // Cria overlay visual
const overlay = document.createElement("div");
overlay.id = "gear-overlay";
overlay.style.position = "absolute";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.right = "0";
overlay.style.bottom = "0";
overlay.style.pointerEvents = "none";
overlay.style.zIndex = "999";
wrapper.appendChild(overlay);

    wrapper.classList.add("gear-wrapper");
    wrapper.style.position = "relative";
    wrapper.style.width = "500px";
    wrapper.style.height = "250px";
    wrapper.style.background = "#111";

    for (const [slotId] of Object.entries(actor.system.gearSlots)) {
      const slotData = actor.system.gearSlots[slotId];
      const pos = GearConstants.GEAR_SLOT_POSITIONS[slotId];
      const size = GearConstants.SLOT_LAYOUT[slotId];
      if (!pos || !size) continue;

      const baseSlot = document.createElement("div");
      const overlayBox = document.createElement("div");
overlayBox.classList.add("gear-slot-overlay");
overlayBox.style.position = "absolute";
overlayBox.style.top = "0";
overlayBox.style.left = "0";
overlayBox.style.right = "0";
overlayBox.style.bottom = "0";
overlayBox.style.pointerEvents = "none";
baseSlot.appendChild(overlayBox);

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
          const iw = item.system.grid?.w ?? 1;
          const ih = item.system.grid?.h ?? 1;
          const slotW = size.w;
          const slotH = size.h;

          const img = document.createElement("img");
          img.src = item.img;
          img.style.position = "absolute";
          img.style.objectFit = "contain";
          img.style.zIndex = "1";

          if (iw > slotW || ih > slotH) {
            img.style.width = "100%";
            img.style.height = "100%";
          } else {
            img.style.width = `${iw * GearConstants.SLOT_WIDTH}px`;
            img.style.height = `${ih * GearConstants.SLOT_HEIGHT}px`;
            img.style.left = "50%";
            img.style.top = "50%";
            img.style.transform = "translate(-50%, -50%)";
          }

          baseSlot.appendChild(img);
        }
      }

      const slot = baseSlot.cloneNode(true);
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
          if (!valid) return;


          const currentId = actor.system.gearSlots[slotId]?.itemId;
          const currentItem = currentId ? actor.items.get(currentId) : null;

          if (currentItem && currentItem.id !== item.id) {
            console.debug(`[Swap] Slot ${slotId} ocupado por ${currentItem.name}, iniciando swap`);
            await game.tm.GearManager.unequipItem(actor, slotId);
            await game.tm.GearManager.equipItem(actor, item, slotId);

            game.tm.GridPickup.pickupData = null;
            game.tm.GridPickup._removePreview();
            game.tm.GridPickup._removeOverlay();
            game.tm.GridPickup._removeListeners();
            game.tm.GridDelete.disable();

            game.tm.GridPickup.start(actor, currentItem, false, null, e);
            await currentItem.update({ "system.equippedSlot": null });

            const imgs = gridContainer?.querySelectorAll(".grid-item-image");
            imgs?.forEach(el => {
              const bg = el.style.backgroundImage;
              if (bg.includes(currentItem.img)) el.remove();
            });

          } else {
            await game.tm.GearManager.equipItem(actor, item, slotId);
            game.tm.GridPickup.pickupData = null;
            game.tm.GridPickup._removePreview();
            game.tm.GridPickup._removeOverlay();
            game.tm.GridPickup._removeListeners();
          }

          if (gearContainer) game.tm.GearRenderer.render(gearContainer, actor);
          if (gridContainer) {
            const grid = game.tm.GridUtils.createVirtualGrid(actor);
            game.tm.GridRenderer.renderGrid(gridContainer, grid);
          }

          const sheet = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
          if (sheet?.render) sheet.render(true);

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

          const sheet = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
          if (sheet?.render) sheet.render(true);

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

          const sheet = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
          if (sheet?.render) sheet.render(true);
        }
      });

      wrapper.appendChild(slot);
    }

    container.appendChild(wrapper);
  }
}
