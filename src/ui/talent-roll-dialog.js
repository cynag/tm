export class TalentRollDialog extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "talent-roll-dialog",
      classes: ["tm", "dialog", "talent-roll"],
      template: "systems/tm/templates/ui/talent-roll-dialog.hbs",
      width: 400,
      height: "auto",
      title: "Teste de Talento",
    });
  }

  constructor(actor, talent, baseBonus = 0) {
    super();
    this.actor = actor;
    this.talent = talent;
    this.baseBonus = baseBonus;
    this.state = {
      boons: 0,
      difficulty: 0,
      help: false,
      knowledge: false,
      situation: false,
      tool: false,
    };
  }

  static show({ actor, type, id, baseBonus = 0 }) {
    const db = type === "skill" ? game.tm.SkillsDB : game.tm.KnowledgesDB;
    const talent = db.find(t => t.id === id);
    new TalentRollDialog(actor, talent, baseBonus).render(true);
  }

  getData() {
    const points = this._getTalentPoints();
    const level = this._getLevel(points);
    const penalty = this._getDifficultyPenalty();
    const situationalBonus = this._getSituationalBonus();
    const totalBonus = this.baseBonus + this._getAttributeBonus() + situationalBonus + penalty;

    return {
      ...this.state,
      diceLabel: this._getDiceLabel(),
      totalBonus,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".stepper .step-up").on("click", ev => this._adjust(ev, +1));
    html.find(".stepper .step-down").on("click", ev => this._adjust(ev, -1));
    html.find("input[type='checkbox']").on("change", ev => this._toggleCheckbox(ev));
    html.find(".cancel").on("click", () => this.close());
    html.find(".roll").on("click", async ev => {
      await this._roll();
      this.close();
    });
  }

  _adjust(ev, delta) {
    const field = $(ev.currentTarget).parent().data("field");
    this.state[field] = Math.clamp(
  (this.state[field] || 0) + delta,
  0,
  field === "boons" ? 2 : 4
  );
    this.render();
  }

  _toggleCheckbox(ev) {
    const field = ev.currentTarget.dataset.field;
    this.state[field] = ev.currentTarget.checked;
    this.render();
  }

  _getTalentPoints() {
    const pool = this.talent.type === "skill"
      ? this.actor.system.talents?.skills
      : this.actor.system.talents?.knowledges;

    return pool?.[this.talent.id] ?? 0;
  }

  _getLevel(points) {
    const levels = [
      { min: 0, bonus: 0 },
      { min: 1, bonus: 10 },
      { min: 2, bonus: 25 },
      { min: 4, bonus: 40 },
      { min: 7, bonus: 60 },
    ];
    return [...levels].reverse().find(l => points >= l.min) || { bonus: 0 };
  }

  _getAttributeBonus() {
    // Placeholder: substituir se quiser incluir modificador de atributo real
    return 0;
  }

  _getDifficultyPenalty() {
    return [-0, -10, -20, -40, -60][this.state.difficulty] || 0;
  }

  _getSituationalBonus() {
    let bonus = 0;
    if (this.state.help) bonus += 10;
    if (this.state.knowledge) bonus += 10;
    if (this.state.situation) bonus += 10;
    if (this.state.tool) bonus += 5;
    return bonus;
  }

  _getDiceLabel() {
    const count = 1 + this.state.boons;
    return `${count}d100 (melhor resultado)`;
  }

  async _roll() {
  const count = 1 + this.state.boons;
  const totalBonus = this.getData().totalBonus;

  const formula = `${count}d100`;
  const roll = new Roll(formula);
  await roll.evaluate();

  const results = roll.terms[0].results.map(r => r.result);
  const final = Math.min(...results);

  roll._total = final;

  const success = final <= totalBonus;
  const resultText = success ? "SUCESSO" : "FALHA";

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    flavor: `
      <strong>TESTE DE ${this.talent.name}</strong><br>
      Rolou ${count}d100 → <strong>${final}</strong><br>
      Valor do teste: ${totalBonus}%<br>
      <strong>${resultText}</strong>
    `,
  });
}





}
