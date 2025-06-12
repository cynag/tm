export class GridRotate {
  static rotateCurrent() {
    const pickup = game.tm.GridPickup.pickupData;
    if (!pickup) return;

    const { w: origW, h: origH } = pickup.original ?? {};
    if (!origW || !origH || origW === origH) {
      console.log("[GridRotate] ⏭️ Item não pode ser rotacionado");
      return;
    }

    // Aplica rotação real
    pickup.rotated = !pickup.rotated;
    [pickup.w, pickup.h] = [pickup.h, pickup.w];

    const actor = game.actors.get(pickup.actorId);
    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    const container = app?.element.find("#grid-inventory")[0];
    const gridEl = container?.querySelector(".grid");
    if (!gridEl) return;

    const bounds = gridEl.getBoundingClientRect();
    const relX = pickup.mousePos.x - bounds.left;
    const relY = pickup.mousePos.y - bounds.top;
    const grid = game.tm.GridUtils.createVirtualGrid(actor);

    // Recria ghost e overlay sem bloquear rotação
    game.tm.GridPreview.remove();
    game.tm.GridPreview.create(pickup);
    game.tm.GridOverlay.update(actor, grid, relX, relY);

    // Força novo mousemove
    const { x, y } = pickup.mousePos;
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));

    console.log("[GridRotate] 🔄 Rotacionado");
  }
}
