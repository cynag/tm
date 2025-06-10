export class GridOverlay {
  static overlay = null;

  static create(container) {
  //console.log("[GridOverlay] create chamado");
  this.overlay?.remove();

  const overlay = document.createElement("div");
  overlay.id = "grid-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.zIndex = "9999";
  overlay.style.pointerEvents = "none";
  overlay.style.display = "block";

  if (container) {
    //console.log("[GridOverlay] container encontrado:", container);
    //console.log("[GridOverlay] container.innerHTML (antes):", container.innerHTML);
    container.style.position = "relative";
    container.style.overflow = "hidden";
    container.appendChild(overlay);
    //console.log("[GridOverlay] overlay inserido no DOM");
  } else {
    //console.warn("[GridOverlay] container é nulo ou indefinido!");
  }

  this.overlay = overlay;
  
}


  static update(actor, grid, mouseX, mouseY) {
  if (!this.overlay || !game.tm.GridPickup.pickupData) return;

  const overlayBounds = this.overlay.getBoundingClientRect();
  const localX = mouseX - overlayBounds.left;
  const localY = mouseY - overlayBounds.top;

  const { w, h, rotated } = game.tm.GridPickup.pickupData;
  const gridX = Math.floor(localX / 50);
  const gridY = Math.floor(localY / 50);

      const valid = game.tm.GridUtils.isSpaceFree(grid, gridX, gridY, w, h);
  const color = valid ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)";
  this.overlay.innerHTML = "";

  const width = rotated ? h : w;
  const height = rotated ? w : h;

  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
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
