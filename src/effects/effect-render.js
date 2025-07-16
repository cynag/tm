export class EffectRender {
  static async update(actor) {
  if (!actor || !actor.token) {
    console.log("[EffectRender] Ignorado — ator sem token ativo.");
    return;
  }

  const token = canvas.tokens.get(actor.token?.id) 
    ?? canvas.tokens.placeables.find(t => t.document.actor?.id === actor.id);

  if (!token || !token.object || !token.visible) {
    console.log(`[EffectRender] Ignorado — token ausente ou invisível (${actor.name})`);
    return;
  }


    const logicalEffects = actor.system.activeEffects ?? [];
    const logicalIds = logicalEffects.map(e => e.id);
    const allActive = actor.effects.contents;

    // Remove ActiveEffects órfãos (estão em actor.effects, mas não no system.activeEffects)
    const toDelete = allActive.filter(e => {
      const id = e.getFlag("tm", "effectId");
      const fromSystem = e.getFlag("tm", "source") === "resistance-roll";
      const shouldDelete = fromSystem && id && !logicalIds.includes(id);
      if (shouldDelete) console.log(`[🧼] Removendo efeito órfão: ${e.name}`, { id });
      return shouldDelete;
    });

    if (toDelete.length > 0) {
      for (let effect of toDelete) {
        await effect.delete(); // 🧨 isso é o que realmente remove o overlay
      }
    }

    // Agora pega os efeitos ainda válidos
    const activeEffects = allActive.filter(e => {
      const id = e.getFlag("tm", "effectId");
      const fromSystem = e.getFlag("tm", "source") === "resistance-roll";
      return fromSystem && id && logicalIds.includes(id);
    });

    // Agrupa por imagem
    const grouped = activeEffects.reduce((map, e) => {
      const icon = e.img;
      if (!icon) return map;
      const current = map[icon] || { icon, label: e.name, count: 0 };
      current.count += 1;
      map[icon] = current;
      return map;
    }, {});

    const overlays = Object.values(grouped).map(e => ({
      icon: e.icon,
      overlay: true,
      label: e.label
    }));

    await token.document.update({ effects: overlays });
    token.object?.drawEffects();

    if (overlays.length === 0) {
      await token.document.update({ effects: [] });
      token.object?.drawEffects();
      console.log(`[💣] Overlays zerados manualmente para ${actor.name}`);
    }

    console.log(`[EffectRender] Overlays atualizados para ${actor.name}:`, overlays);
  }


  static bindHooks() {
    Hooks.on("updateActor", (actor, changes) => {
  if (!(actor instanceof CONFIG.Actor.documentClass)) return;
  if (!actor.token) return; // só tokens ativos

  const afChanged = foundry.utils.hasProperty(changes, "system.activeEffects");
  if (afChanged) {
    console.log("[EffectRender] system.activeEffects alterado — forçando update visual");
    EffectRender.update(actor);
  }
});


    Hooks.on("createActiveEffect", (effect) => {
      const actor = effect.parent;
      if (actor instanceof CONFIG.Actor.documentClass) {
        EffectRender.update(actor);
      }
    });

    Hooks.on("deleteActiveEffect", (effect) => {
      const actor = effect.parent;
      if (actor instanceof CONFIG.Actor.documentClass) {
        EffectRender.update(actor);
      }
    });
  }
}

// Contador visual (badge)
Hooks.on("refreshToken", (token) => {
  const container = token.icon?.children?.[1];
  if (!container) return;

  container.querySelectorAll(".tm-overlay-stack").forEach(el => el.remove());

  const iconCounts = {};
  token.document.effects.forEach(e => {
    const icon = e.icon || e.img;
    iconCounts[icon] = (iconCounts[icon] || 0) + 1;
  });

  token.document.effects.forEach((eff, i) => {
    const img = container.children[i];
    if (!img) return;

    const icon = eff.icon || eff.img;
    const count = iconCounts[icon] ?? 1;
    if (count <= 1) return;

    const badge = document.createElement("div");
    badge.className = "tm-overlay-stack";
    badge.textContent = count;

    img.style.position = "relative";
    img.appendChild(badge);
  });
});
