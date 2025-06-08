export class TMBaseActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "actor"],
      template: "systems/tm/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600
    });
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    console.log("🛠️ [TMBaseActorSheet] getData | Actor:", this.actor?.name);
    return context;
  }

  _activateCoreListeners(html) {
    console.warn("🛠️ [TMBaseActorSheet] Skipping _activateCoreListeners due to V1 bug.");
    return;
  }
}
