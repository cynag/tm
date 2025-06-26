export class MovementDialog {
  static show(entry, range) {
    const description = this.getDescription(entry.id, range);

    const html = `
      <div class="movement-dialog-content">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <img src="${entry.img}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
          <div>
            <h2 style="margin:0; font-size: 16px; color: var(--color-text-light);">${entry.name}</h2>
            <p style="margin:0; font-size: 13px; color: var(--color-text-light-secondary);">${entry.cost} PA</p>
          </div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-light); line-height: 1.3;">
          ${description}
        </div>
      </div>
    `;

    new Dialog({
      title: `[${entry.cost} PA] ${entry.name}`,
      content: html,
      buttons: {
        close: {
          label: "Cancelar"
        },
        use: {
          icon: '<i class="fas fa-person-running"></i>',
          label: "Usar Ação",
          callback: async () => {
  const actor = game.actors.get(entry.actorId);
  if (!actor) return ui.notifications.warn("Ator não encontrado.");

  const currentPA = actor.system.player_pa;
  if (currentPA < entry.cost) {
    return ui.notifications.warn(`Você não tem PA suficiente para usar ${entry.name}.`);
  }

  const newPA = Math.max(0, currentPA - entry.cost);
  await actor.update({ "system.player_pa": newPA });

  const chatHTML = `
    <div class="tm-chat-card" style="padding: 5px 8px;">
      <div class="card-header" style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 4px;">
        <img src="${entry.img}" width="32" height="32" style="border:1px solid #555; border-radius:4px;" />
        <div style="display: flex; flex-direction: column;">
          <strong>${entry.name}</strong>
          <div style="display: flex; gap: 6px; margin-top: 2px;">
            <span class="tag">-${entry.cost} PA</span>
            <span class="tag">Movimento</span>
          </div>
        </div>
      </div>
      <div class="card-description" style="margin-left: 40px; font-size: 13px;">
        ${MovementDialog.getDescription(entry.id, range)}
      </div>
    </div>
  `;

  ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor }),
    content: chatHTML
  });

  console.log(`[Movimento] ${entry.name} usado (${entry.cost} PA)`);
}
        }
      },
      default: "use"
    }).render(true);
  }

  static getDescription(id, meters) {
    switch (id) {
      case "move_short":
        return `Você se move com cautela por até <strong>${meters} metros</strong>, tentando não chamar atenção.`;
      case "move_standard":
        return `Você se move normalmente por até <strong>${meters} metros</strong>, em qualquer direção.`;
      case "move_dash":
        return `Você avança com pressa por até <strong>${meters} metros</strong>, abrindo mão de defesas.`;
      default:
        return `Você se move por até <strong>${meters} metros</strong>.`;
    }
  }
}
