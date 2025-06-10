export class GridRotate {
  static register() {
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() !== "r") return;
      if (!game.tm.GridPickup?.current) return;

      e.preventDefault();
      game.tm.GridPickup.rotate();

      const app = game.user?.targets?.values()?.next()?.value?.sheet ?? ui?.windows?.find(w => w instanceof ActorSheet);
      if (app) game.tm.GridInventory.refresh(app);
    });
  }
}
