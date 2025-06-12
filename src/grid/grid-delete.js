export class GridDelete {
  static enable() {
    // Ativa listener global de clique
    window.addEventListener("mousedown", this._onClickDelete);
  }

  static disable() {
    window.removeEventListener("mousedown", this._onClickDelete);
  }

  static _onClickDelete(event) {
    if (event.button !== 0) return; // Só LMB

    const pickup = game.tm.GridPickup.pickupData;
    if (!pickup) return;

    // Verifica se o mouse está fora da ficha
    const app = Object.values(ui.windows).find(w => w.actor?.id === pickup.actorId);
    const bounds = app?.element[0]?.getBoundingClientRect();
    if (!bounds) return;

    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      const actor = game.actors.get(pickup.actorId);
      const item = actor.items.get(pickup.itemId);
      if (!actor || !item) return;

      console.log(`[GridDelete] 🗑️ Excluindo ${item.name}`);
      ui.notifications.info(`${item.name} excluído!`);

      actor.deleteEmbeddedDocuments("Item", [item.id]);
      game.tm.GridPickup.cancel();
    }
  }
} 
