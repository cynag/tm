export class GearOverlay {
  static lastSlotId = null;

  static update(actor, pickup) {
    const item = game.actors.get(pickup.actorId)?.items.get(pickup.itemId);
    if (!item) return;

    const slotEl = document.elementFromPoint(pickup.mousePos.x, pickup.mousePos.y);
    const baseSlotEl = slotEl?.closest(".gear-slot");
    if (!baseSlotEl) {
      this.clear();
      return;
    }

    const slotId = baseSlotEl.dataset.slotId;
    if (!slotId || slotId === this.lastSlotId) return;
    this.lastSlotId = slotId;

    const valid = game.tm.GearUtils.isValidForSlot(item, slotId);
    const currentId = actor.system.gearSlots[slotId]?.itemId;

    this.clear();

    const overlayEl = baseSlotEl.querySelector(".gear-slot-overlay");
    if (!overlayEl) return;

    if (valid && !currentId) {
      overlayEl.dataset.gearOverlay = "valid";
    } else if (valid && currentId && currentId !== item.id) {
      overlayEl.dataset.gearOverlay = "swap";
    } else {
      overlayEl.dataset.gearOverlay = "invalid";
    }
  }

  static clear() {
    const all = document.querySelectorAll(".gear-slot-overlay[data-gear-overlay]");
    all.forEach(el => el.removeAttribute("data-gear-overlay"));
    this.lastSlotId = null;
  }
}
