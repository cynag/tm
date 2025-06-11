export class GridPickup {
  static pickupData = null;

  static start(actor, item, fromGrid = true, origin = null, event = null) {
    if (this.pickupData) this.cancel();
    console.log("[GridPickup] ✅ Pickup iniciado:", item.name);

    const meta = actor.system.gridInventory?.items?.find(i => i.id === item.id);
    const rotated = meta?.rotated ?? false;

    const rawW = item.system.grid?.w ?? 1;
    const rawH = item.system.grid?.h ?? 1;

    const w = rotated ? rawH : rawW;
    const h = rotated ? rawW : rawH;

    this.pickupData = {
      actorId: actor.id,
      itemId: item.id,
      w,
      h,
      rotated,
      origin,
      img: item.img,
      fromGrid,
      mousePos: event ? { x: event.clientX, y: event.clientY } : { x: 0, y: 0 }
    };

    this._activatePreview();
    this._addListeners();

    const waitForGridReady = async () => {
      const maxTries = 20;
      let tries = 0;

      while (tries < maxTries) {
        const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
        const container = app?.element.find("#grid-inventory")[0];
        const grid = container?.querySelector(".grid");

        if (grid && grid.offsetWidth > 0 && grid.offsetHeight > 0) {
          console.log("[GridPickup] ✅ Overlay criado (via waitUntil)");
          game.tm.GridOverlay.create(container);
          return;
        }

        tries++;
        await new Promise(r => setTimeout(r, 50));
      }

      console.warn("[GridPickup] ❌ Timeout: grid nunca ficou pronta");
    };

    waitForGridReady();
  }

  static cancel() {
    if (!this.pickupData) return;
    console.log("[GridPickup] ❌ Pickup cancelado");

    const { actorId, itemId, origin, w, h } = this.pickupData;
    if (origin) {
      const actor = game.actors.get(actorId);
      const item = actor.items.get(itemId);
      if (actor && item) {
        console.log("[GridPickup] ↩️ Item restaurado na posição original");
        game.tm.GridPositioner.placeItem(actor, item, origin.x, origin.y, w > h);
      }
    }

    this.pickupData = null;
    this._removePreview();
    this._removeOverlay();
    this._removeListeners();
  }

  static _activatePreview() {
    const pickup = this.pickupData;
    const actor = game.actors.get(pickup.actorId);

    game.tm.GridPreview.create(pickup);

    const move = (e) => {
      if (!e || typeof e.clientX !== "number") return;

      const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
      const container = app?.element.find("#grid-inventory")[0];
      const gridEl = container?.querySelector(".grid");

      let snap = false;
      if (gridEl) {
        const bounds = gridEl.getBoundingClientRect();
        if (
          e.clientX >= bounds.left &&
          e.clientX <= bounds.right &&
          e.clientY >= bounds.top &&
          e.clientY <= bounds.bottom
        ) {
          snap = true;
          const relX = e.clientX - bounds.left;
          const relY = e.clientY - bounds.top;
          const grid = game.tm.GridUtils.createVirtualGrid(actor);
          game.tm.GridOverlay.update(actor, grid, relX, relY);
          console.log("[GridPickup] 🟩 Snap + overlay update");
        } else {
          game.tm.GridOverlay.clear();
        }
      }

      game.tm.GridPreview.update(e.clientX, e.clientY, snap);
    };

    window.addEventListener("mousemove", move, { passive: true });
    this._ghostMoveHandler = move;

    // força render inicial
    setTimeout(() => {
      const { x, y } = pickup.mousePos;
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));
    }, 50);
  }

  static _removePreview() {
    game.tm.GridPreview.remove();
    console.log("[GridPickup] 🧹 Preview removido");

    if (this._ghostMoveHandler) {
      window.removeEventListener("mousemove", this._ghostMoveHandler);
      this._ghostMoveHandler = null;
    }
  }

  static _addListeners() {
    this._escHandler = (e) => {
      if (e.key === "Escape") this.cancel();
    };

    this._rotateHandler = (e) => {
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        game.tm.GridRotate.rotateCurrent();
      }
    };

    this._rmbHandler = (e) => {
      if (e.button === 2) {
        e.preventDefault();
        this.cancel();
      }
    };

    document.addEventListener("keydown", this._escHandler);
    document.addEventListener("keydown", this._rotateHandler);
    document.addEventListener("mousedown", this._rmbHandler);

    console.log("[GridPickup] 🎧 Listeners adicionados");
  }

  static _removeListeners() {
    document.removeEventListener("keydown", this._escHandler);
    document.removeEventListener("keydown", this._rotateHandler);
    document.removeEventListener("mousedown", this._rmbHandler);
    this._rotateHandler = null;
    console.log("[GridPickup] 🔇 Listeners removidos");
  }

  static _removeOverlay() {
    game.tm.GridOverlay.remove();
    console.log("[GridPickup] 🧹 Overlay removido");
  }
}
