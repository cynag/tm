export class TMActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "actor"],
      width: 600,
      height: "auto",
      resizable: true,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  get template() {
    return `systems/tm/templates/actor/actor-sheet.hbs`;
  }

  async getData() {
    const context = await super.getData();
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
