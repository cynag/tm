export class GridInventory {
  static init() {
    console.log("[GridInventory] Initialized");
    // Future global hooks or listeners can go here
  }

  /**
   * Forces the re-render of the grid section in the actor sheet.
   * Can be used after placing/removing items.
   */
  static refresh(actorSheet) {
    console.log("[GridInventory] Refreshing inventory grid");

    const grid = game.tm.GridUtils.createVirtualGrid(actorSheet.actor);
    const container = actorSheet.element.find("#grid-inventory")[0];
    if (container) game.tm.GridRenderer.renderGrid(container, grid);
  }
}
