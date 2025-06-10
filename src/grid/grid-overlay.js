export class GridOverlay {
  static overlay = null;

  static create(container) {
    this.overlay?.remove();

    const overlay = document.createElement("div");
    overlay.id = "grid-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "500px";
    overlay.style.height = "250px";
    overlay.style.zIndex = "10";
    overlay.style.pointerEvents = "none";

    container.appendChild(overlay);
    this.overlay = overlay;
  }

  static update(actor, grid, mouseX, mouseY) {
    if (!this.overlay || !game.tm.GridPickup.pickupData) return;

    const { w, h, rotated } = game.tm.GridPickup.pickupData;
    const gridX = Math.floor(mouseX / 50);
    const gridY = Math.floor(mouseY / 50);

    const valid = game.tm.GridUtils.isSpaceFree(grid, gridX, gridY, w, h);
    const color = valid ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)";

    this.overlay.innerHTML = "";

    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const cell = document.createElement("div");
        cell.style.position = "absolute";
        cell.style.width = "50px";
        cell.style.height = "50px";
        cell.style.left = `${(gridX + dx) * 50}px`;
        cell.style.top = `${(gridY + dy) * 50}px`;
        cell.style.backgroundColor = color;
        this.overlay.appendChild(cell);
      }
    }
  }

  static remove() {
    this.overlay?.remove();
    this.overlay = null;
  }
}
