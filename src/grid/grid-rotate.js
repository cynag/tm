export class GridRotate {
  static rotateCurrent() {
    const pickup = game.tm.GridPickup.pickupData;
    if (!pickup) return;

    if (pickup.w === pickup.h) {
      console.log("[GridRotate] ⏭️ Item quadrado não rotaciona");
      return;
    }

    // Inverte rotação
    pickup.rotated = !pickup.rotated;

    // Inverte dimensões
    [pickup.w, pickup.h] = [pickup.h, pickup.w];

    // Recria ghost com nova rotação
    game.tm.GridPreview.remove();
    game.tm.GridPreview.create(pickup);
    const actor = game.actors.get(pickup.actorId);
const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
const container = app?.element.find("#grid-inventory")[0];
const gridEl = container?.querySelector(".grid");

if (gridEl) {
  const bounds = gridEl.getBoundingClientRect();
  const relX = pickup.mousePos.x - bounds.left;
  const relY = pickup.mousePos.y - bounds.top;
  const grid = game.tm.GridUtils.createVirtualGrid(actor);
  game.tm.GridOverlay.update(actor, grid, relX, relY);
}


    const { x, y } = pickup.mousePos;
document.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));

    console.log("[GridRotate] 🔄 Rotacionado");
  }
}
