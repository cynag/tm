export class RaceSelector extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.selectedRace = actor.flags?.tm?.raceData ?? null;
    this.readOnly = options.readOnly ?? false;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "race-selector",
      classes: ["tm", "race-selector"],
      template: "systems/tm/templates/race/race-selector.hbs",
      width: "100%",
      height: "100%",
      resizable: false,
      popOut: false,
      renderTarget: null
    });
  }

  getData() {
  const races = game.tm?.RaceDB || [];
  if (!this.selectedRace && races.length > 0) {
    this.selectedRace = races[0];
    //console.log("[RaceSelector] Primeira raça ativada automaticamente:", this.selectedRace.name);
  }

  return {
    races,
    selected: this.selectedRace,
    readOnly: this.readOnly
  };
}

  async _renderOuter(...args) {
    const html = await super._renderOuter(...args);
    document.body.appendChild(html[0]);
    return html;
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.readOnly) {
      html.find(".race-card").on("click", (ev) => {
        const raceId = ev.currentTarget.dataset.raceId;
        this.selectedRace = game.tm.RaceDB.find(r => r.id === raceId);
        this.render(false);
      });

      html.find(".btn-confirm").on("click", async () => {
  if (!this.selectedRace) return;

  // 🔧 Sempre limpa dados anteriores
  await this.actor.unsetFlag("tm", "raceData");
  await this.actor.unsetFlag("tm", "subRaceData");

  if (this.selectedRace.subraces?.length) {
    const { SubRaceSelector } = await import("./subrace-selector.js");

    new SubRaceSelector(this.actor, this.selectedRace, async (subrace) => {
  subrace.raceId = this.selectedRace.id;

  await this.actor.setFlag("tm", "raceConfirmed", true);
  await this.actor.setFlag("tm", "raceData", this.selectedRace);
  await this.actor.setFlag("tm", "subRaceData", subrace);
  
  this.close();
}, this).render(true);


  } else {
    await this.actor.setFlag("tm", "raceConfirmed", true);
    await this.actor.setFlag("tm", "raceData", this.selectedRace);
    //ui.notifications.info(`Raça "${this.selectedRace.name}" escolhida.`);
    this.close();
  }
});

    } else {
      html.find(".btn-change").on("click", () => {
        const selector = new RaceSelector(this.actor, { readOnly: false });
        this.close();
        selector.render(true);
      });
    }

    html.find(".btn-cancel").on("click", () => {
      this.close();
    });
  }
}
