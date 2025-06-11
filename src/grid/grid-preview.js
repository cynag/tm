export class GridPreview {
  static ghost = null;

  static create(pickupData) {
    this.remove();

    const ghost = document.createElement("img");
    ghost.id = "pickup-ghost";
    ghost.src = pickupData.img;
    ghost.classList.add("ghost-preview");
    ghost.style.position = "fixed";

    ghost.style.transformOrigin = "top left";

if (pickupData.rotated) {
  ghost.style.width = `${pickupData.h * 50}px`;
  ghost.style.height = `${pickupData.w * 50}px`;
  ghost.style.transform = "rotate(90deg)";
} else {
  ghost.style.width = `${pickupData.w * 50}px`;
  ghost.style.height = `${pickupData.h * 50}px`;
  ghost.style.transform = "none";
}


    ghost.style.zIndex = "10000";
    ghost.style.pointerEvents = "none";
    ghost.style.opacity = "0.8";



    document.body.appendChild(ghost);
    this.ghost = ghost;

    console.log("[GridPreview] 👻 Ghost criado");
    const { x, y } = pickupData.mousePos;
this.update(x, y, true); // ✅ já aplica snap imediatamente

  }

  static update(x, y, snap = false) {
    if (!this.ghost) return;

    const rotated = this.ghost.style.transform.includes("rotate(90deg)");

    if (snap) {
  const app = Object.values(ui.windows).find(w => w.actor?.id === game.tm.GridPickup.pickupData.actorId);
  const container = app?.element.find("#grid-inventory")[0];
  const gridEl = container?.querySelector(".grid");
  if (!gridEl) return;

  const bounds = gridEl.getBoundingClientRect();
  const relX = x - bounds.left;
  const relY = y - bounds.top;

  const gridX = Math.floor(relX / 50) * 50;
  const gridY = Math.floor(relY / 50) * 50;

  this.ghost.style.left = `${bounds.left + gridX}px`;
this.ghost.style.top = `${bounds.top + gridY}px`;
this.ghost.style.transform = rotated
  ? "rotate(90deg) translate(0, -100%)"
  : "translate(0, 0)";


}
else {
      this.ghost.style.left = `${x}px`;
      this.ghost.style.top = `${y}px`;
      if (rotated) {
  this.ghost.style.transform = "rotate(90deg) translate(0, 0)";
} else {
  this.ghost.style.transform = "translate(0, 0)";
}

    }
  }

  static remove() {
    if (this.ghost) {
      this.ghost.remove();
      this.ghost = null;
      console.log("[GridPreview] 🧹 Ghost removido");
    }
  }
}
