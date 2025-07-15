export class MovementDialog {
  static show(entry, range) {
    const description = game.i18n.format(entry.description, { meters: range });

    const html = `
      <div class="movement-dialog-content">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <img src="${entry.img}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
          <div>
            <h2 style="margin:0; font-size: 16px; color: var(--color-text-light);">${entry.name}</h2>
            <p style="margin:0; font-size: 13px; color: var(--color-text-light-secondary);">${entry.cost} ${game.i18n.localize("TM.Label.AP")}</p>
          </div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-light); line-height: 1.3;">
          ${description}
        </div>
      </div>
    `;

    new Dialog({
      title: `[${entry.cost} ${game.i18n.localize("TM.Label.AP")}] ${entry.name}`,
      content: html,
      buttons: {
        close: {
          label: game.i18n.localize("TM.Button.Cancel")
        },
        use: {
          icon: '<i class="fas fa-person-running"></i>',
          label: game.i18n.localize("TM.Button.UseAction"),
          callback: async () => {
            const actor = game.actors.get(entry.actorId);
            if (!actor) return ui.notifications.warn(game.i18n.localize("TM.Warn.ActorNotFound"));

            const currentPA = actor.system.player_pa;
            if (currentPA < entry.cost) {
              return ui.notifications.warn(
                game.i18n.format("TM.Warn.NotEnoughPA", { name: entry.name })
              );
            }

            const newPA = Math.max(0, currentPA - entry.cost);
            await actor.update({ "system.player_pa": newPA });

            const chatHTML = `
              <div class="tm-chat-card" style="padding: 5px 8px;">
                <div class="card-header" style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 4px;">
                  <img src="${entry.img}" width="35" height="35" style="border:1px solid #555; border-radius:4px;" />
                  <div style="display: flex; flex-direction: column;">
                    <strong>${entry.name}</strong>
                    <div style="display: flex; gap: 6px; margin-top: 2px;">
                      <span class="tag">-${entry.cost} ${game.i18n.localize("TM.Label.AP")}</span>
                      <span class="tag">${game.i18n.localize("TM.Tag.Movement")}</span>
                    </div>
                  </div>
                </div>
                <div class="card-description" style="margin-left: 40px; font-size: 13px;">
                  ${description}
                </div>
              </div>
            `;

            ChatMessage.create({
              user: game.user.id,
              speaker: ChatMessage.getSpeaker({ actor }),
              content: chatHTML
            });

            console.log(`[Movement] ${entry.name} used (${entry.cost} AP)`);
          }
        }
      },
      default: "use"
    }).render(true);
  }
}
