export class GridPickup {
  static pickupData = null;

  static start(actor, item, fromGrid = true, origin = null, event = null) {
    // Cancela pickup anterior se houver
    if (this.pickupData) this.cancel();
    console.log("[DEBUG] event:", event);
    console.log("[DEBUG] mousePos:", event?.clientX, event?.clientY);
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
  }

  static cancel() {
    if (!this.pickupData) return;
    console.log("[GridPickup] Pickup cancelado.");

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
    ghost.style.width = `${this.pickupData.w * 50}px`;
    ghost.style.height = `${this.pickupData.h * 50}px`;

    // Posiciona ghost imediatamente no local do clique
    const pos = this.pickupData.mousePos ?? { x: 0, y: 0 };
    ghost.style.left = `${pos.x}px`;
    ghost.style.top = `${pos.y}px`;

    document.body.appendChild(ghost);


    // Overlay dinâmico com base na posição do cursor
const actor = game.actors.get(this.pickupData.actorId);
const grid = game.tm.GridUtils.createVirtualGrid(actor);
const container = document.getElementById("grid-overlay")?.parentElement;

const move = (e) => {
  ghost.style.left = `${e.clientX}px`;
  ghost.style.top = `${e.clientY}px`;

  if (!container) return;

const bounds = container.getBoundingClientRect();
const relX = e.clientX - bounds.left;
const relY = e.clientY - bounds.top;

game.tm.GridOverlay.update(actor, grid, relX, relY);
};


    document.addEventListener("mousemove", move);
    this._ghostMoveHandler = move;
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
