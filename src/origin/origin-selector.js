// src/origin/origin-selector.js

export class OriginSelector extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.selectedOrigin = null;
    this.readOnly = options.readOnly ?? false;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "origin-selector",
      classes: ["tm", "origin-selector"],
      template: "systems/tm/templates/origin/origin-selector.hbs",
      width: "100%",
      height: "auto",
      popOut: true,
      resizable: false,
      minimizable: false,
      title: "Selecionar Origem"
    });
  }

  getData() {
    return {
      origins: game.tm?.OriginDB || [],
      selected: this.selectedOrigin,
      readOnly: this.readOnly
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.readOnly) {
      html.find(".origin-card").on("click", (ev) => {
        const id = ev.currentTarget.dataset.originId;
        this.selectedOrigin = game.tm.OriginDB.find(o => o.id === id);
        this.render();
      });

      html.find(".btn-confirm").on("click", async () => {
  if (!this.selectedOrigin) return;

  console.log(`[OriginSelector] Origem "${this.selectedOrigin.name}" confirmada.`);

  await this.actor.unsetFlag("tm", "originId");
  await this.actor.unsetFlag("tm", "originScript");

  await this.actor.setFlag("tm", "originId", this.selectedOrigin.id);
  await this.actor.setFlag("tm", "originScript", this.selectedOrigin.origin_effect_script || "");

  await this.actor.setFlag("tm", "originConfirmed", true); // ✅ aqui

  this.close();
});

    }

    html.find(".btn-cancel").on("click", () => {
      this.close();
    });
  }
}
