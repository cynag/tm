// src/race/subrace-selector.js

export class SubRaceSelector extends Application {
  constructor(actor, race, onConfirm = null, options = {}) {
    super(options);
    this.actor = actor;
    this.race = race;
    this.subraces = race.subraces || [];
    this.selected = this.subraces[0] ?? null; // default: primeira subraça
    this.onConfirm = onConfirm; // ← callback externo opcional
  
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "subrace-selector",
      classes: ["tm", "subrace-selector"],
      template: "systems/tm/templates/race/subrace-selector.hbs",
      width: "100%",
      height: "100%",
      resizable: false,
      popOut: false
    });
  }

  getData() {
    const data = {
      subraces: this.subraces,
      selected: this.selected
    };
    //console.log("[SubRaceSelector] getData()", data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    //console.log("[SubRaceSelector] activateListeners");

    html.find(".subrace-card").on("click", (ev) => {
      const subraceId = ev.currentTarget.dataset.subraceId;
      this.selected = this.subraces.find(s => s.id === subraceId);
      console.log("[SubRaceSelector] Subraça selecionada:", this.selected);
      this.render(false);
    });

    html.find(".btn-confirm-subrace").on("click", async () => {
      if (!this.selected) return;
      await this.actor.setFlag("tm", "subRaceData", this.selected);
      //ui.notifications.info(`Subraça "${this.selected.name}" escolhida.`);

      if (typeof this.onConfirm === "function") {
        await this.onConfirm(this.selected);
      }

      this.close();
    });

    html.find(".btn-cancel-subrace").on("click", () => {
      console.log("[SubRaceSelector] Cancelado");
      this.close();
    });
  }
}
