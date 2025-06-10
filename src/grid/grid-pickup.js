export class GridPickup {
  static pickupData = null;

  static start(actor, item, fromGrid = true, origin = null, event = null) {
    if (this.pickupData) this.cancel();
    console.log("[GridPickup] Pickup iniciado:", item.name);

    const w = item.system.grid?.w ?? 1;
    const h = item.system.grid?.h ?? 1;

    this.pickupData = {
      actorId: actor.id,
      itemId: item.id,
      w,
      h,
      rotated: false,
      origin,
      img: item.img,
      fromGrid,
      mousePos: event ? { x: event.clientX, y: event.clientY } : { x: 0, y: 0 }
    };

    this._activateCursorGhost();
    this._addListeners();

    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    const gridDiv = app?.element.find("#grid-inventory")[0];
    if (gridDiv) game.tm.GridOverlay.create(gridDiv);
  }

  static cancel() {
    if (!this.pickupData) return;
    console.log("[GridPickup] Pickup cancelado.");

    const { actorId, itemId, origin, rotated } = this.pickupData;
    if (origin) {
      const actor = game.actors.get(actorId);
      const item = actor.items.get(itemId);
      if (actor && item) {
        game.tm.GridPositioner.placeItem(actor, item, origin.x, origin.y, rotated);
      }
    }

    this.pickupData = null;
    this._removeCursorGhost();
    this._removeOverlay();
    this._removeListeners();
  }

  static _activateCursorGhost() {
    const ghost = document.createElement("img");
    ghost.src = this.pickupData.img;
    ghost.id = "pickup-ghost";
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.opacity = "0.5";
    ghost.style.zIndex = "999";
    ghost.style.objectFit = "cover"; // ✅ aqui

    document.body.appendChild(ghost);

    const actor = game.actors.get(this.pickupData.actorId);
    const grid = game.tm.GridUtils.createVirtualGrid(actor);
    const pos = this.pickupData.mousePos ?? { x: 0, y: 0 };

    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    const gridDiv = app?.element.find("#grid-inventory")[0];
    const container = gridDiv?.querySelector("#grid-overlay")?.parentElement;

    const move = (e) => {
      const pickup = game.tm.GridPickup.pickupData;
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;




    if (pickup.rotated) {
  ghost.style.width = `${pickup.h * 50}px`;
  ghost.style.height = `${pickup.w * 50}px`;
  ghost.style.transform = "rotate(90deg)";
  ghost.style.transformOrigin = "top left";
  ghost.style.translate = `${pickup.w * 50}px 0px`;
} else {
  ghost.style.width = `${pickup.w * 50}px`;
  ghost.style.height = `${pickup.h * 50}px`;
  ghost.style.transform = "";
  ghost.style.transformOrigin = "";
  ghost.style.translate = "";
}





      if (!container) return;

      const bounds = container.getBoundingClientRect();
      const relX = e.clientX - bounds.left;
      const relY = e.clientY - bounds.top;
      game.tm.GridOverlay.update(actor, grid, relX, relY);
    };

    document.addEventListener("mousemove", move);
    this._ghostMoveHandler = move;

    // Chamada imediata pra mostrar overlay mesmo sem mover
    document.dispatchEvent(new MouseEvent("mousemove", {
      clientX: pos.x,
      clientY: pos.y
    }));
  }

  static _removeCursorGhost() {
    const ghost = document.getElementById("pickup-ghost");
    if (ghost) ghost.remove();

    if (this._ghostMoveHandler) {
      document.removeEventListener("mousemove", this._ghostMoveHandler);
      this._ghostMoveHandler = null;
    }
  }

  static _addListeners() {
    this._escHandler = (e) => {
      if (e.key === "Escape") this.cancel();
    };

    this._rmbHandler = (e) => {
      if (e.button === 2) {
        e.preventDefault();
        this.cancel();
      }
    };

    document.addEventListener("keydown", this._escHandler);
    document.addEventListener("mousedown", this._rmbHandler);
  }

  static _removeListeners() {
    document.removeEventListener("keydown", this._escHandler);
    document.removeEventListener("mousedown", this._rmbHandler);
  }

  static _removeOverlay() {
    game.tm.GridOverlay.remove();
  }
}
