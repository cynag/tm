export class GridRotate {
  static register() {
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() !== "r") return;

      const pickup = game.tm.GridPickup?.pickupData;
      if (!pickup) return;

      e.preventDefault();
      pickup.rotated = !pickup.rotated;

      const actor = game.actors.get(pickup.actorId);
      const grid = game.tm.GridUtils.createVirtualGrid(actor);

      const container = document.getElementById("grid-overlay")?.parentElement;
      if (!container) return;

      // Pega posição real do mouse (última posição do ghost)
      const ghost = document.getElementById("pickup-ghost");
      if (!ghost) return;

      const ghostBounds = ghost.getBoundingClientRect();
      const relX = ghostBounds.left + 1 - container.getBoundingClientRect().left;
      const relY = ghostBounds.top + 1 - container.getBoundingClientRect().top;

      game.tm.GridOverlay.update(actor, grid, relX, relY);
    });
  }
}
