export class ItemContextMenu {
  static menuEl = null;

  static show(x, y, actor, item) {
  this.remove();

  // ❌ Só mostra se o item for do tipo "gear"
  const allowedTypes = ["gear", "consumable"];
if (!allowedTypes.includes(item.type)) return;


  game.tm.ItemTooltip?.hide();
  console.log("[ItemContextMenu] ✅ Menu chamado:", item.name);

  const isGM = game.user.isGM;
  const isEquipped = !!item.system.equippedSlot;

  const options = [];


// Equipar ou Desequipar
if (isEquipped) {
  options.push({
    label: "Desequipar",
    action: () => {
      game.tm.GearManager.unequipItem(actor, item.system.equippedSlot);
    }
  });
} else {
  // Armas com escolha direta
  if (item.system.gear_type === "weapon") {


    options.push({
  label: "Equipar na Mão Direita",
  action: () => {
    game.tm.GearManager.equipItem(actor, item, "slot_weapon1");
  }
});

options.push({
  label: "Equipar na Mão Esquerda",
  action: () => {
    game.tm.GearManager.equipItem(actor, item, "slot_weapon2");
  }
});


  }

  // Anéis com escolha direta
  if (item.type === "gear" && item.system.gear_type === "accessory" && item.system.subtype === "ring") {
    options.push({
      label: "Equipar no Anel 1",
      action: () => {
        game.tm.GearManager.equipItem(actor, item, "slot_ring1");
      }
    });

    options.push({
      label: "Equipar no Anel 2",
      action: () => {
        game.tm.GearManager.equipItem(actor, item, "slot_ring2");
      }
    });

  }

  // Itens normais (armaduras, acessórios)
  const slots = Object.entries(actor.system.gearSlots)
    .filter(([slotId, slot]) => !slot.itemId && game.tm.GearUtils.isValidForSlot(item, slotId));

}
// Excluir item (qualquer tipo)
// Dividir Stack (apenas para consumable > ammo com qty > 1)
if (
  item.type === "consumable" &&
  item.system?.category === "ammo" &&
  (item.system?.ammo_quantity ?? 0) > 1
) {
  options.push({
    label: "✂️ Dividir Stack",
    action: () => this.splitStack(actor, item)
  });
}

options.push({
  label: "🗑️ Excluir",
  action: () => {
    actor.deleteEmbeddedDocuments("Item", [item.id]);
  }
});










// Quebrar ou Reparar (GM)
if (game.user.isGM) {
  const system = item.system;
  const type = system.gear_type;
  const isBroken = system.armor_broken || system.weapon_broken;

  if (type === "armor" || type === "weapon") {
    options.push({
      label: isBroken ? "🛠️ Reparar" : "🔧 Quebrar",
      action: async () => {
        if (type === "armor") {
          await item.update({ "system.armor_broken": !system.armor_broken });
        } else if (type === "weapon") {
          await item.update({ "system.weapon_broken": !system.weapon_broken });
        }

        const msg = isBroken ? "reparado" : "quebrado";
        ui.notifications.info(`${item.name} foi marcado como ${msg}.`);

        const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
        if (app) app.render(true);
      }
    });
  }
}



    // Cria o menu visual
    const menu = document.createElement("div");
    menu.classList.add("custom-context-menu");
    menu.style.position = "fixed";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.zIndex = "99999";
    menu.style.background = "#111";
    menu.style.border = "1px solid #555";
    menu.style.padding = "4px 0";
    menu.style.minWidth = "130px";
    menu.style.fontSize = "12px";
    menu.style.fontFamily = "var(--font-primary)";
    menu.style.color = "#fff";
    menu.style.boxShadow = "0 0 6px rgba(0,0,0,0.8)";
    menu.style.borderRadius = "4px";

    for (const opt of options) {
      const el = document.createElement("div");
      el.innerText = opt.label;
      el.style.padding = "6px 12px";
      el.style.cursor = "pointer";
      el.style.whiteSpace = "nowrap";
      el.addEventListener("click", () => {
        opt.action();
        this.remove();
      });
      el.addEventListener("mouseenter", () => el.style.background = "#333");
      el.addEventListener("mouseleave", () => el.style.background = "transparent");
      menu.appendChild(el);
    }

    // Adiciona dentro da janela da ficha (app)
    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    if (!app || !app.element?.[0]) {
      console.warn("[ItemContextMenu] ❌ Ficha não encontrada.");
      return;
    }

    app.element[0].appendChild(menu);
    this.menuEl = menu;

    // Remove ao clicar fora
    setTimeout(() => {
      document.addEventListener("mousedown", this._onGlobalClick);
    }, 0);
  }

  static remove() {
    if (this.menuEl) {
      this.menuEl.remove();
      this.menuEl = null;
    }
    document.removeEventListener("mousedown", this._onGlobalClick);
  }
  
  static _onGlobalClick = (e) => {
    if (!this.menuEl?.contains(e.target)) {
      this.remove();
    }
  };

  static async splitStack(actor, item) {
  const qty = item.system.ammo_quantity ?? 0;
  if (qty <= 1) return;

  const newQty = Math.floor(qty / 2);
  const remainder = qty - newQty;

  // Atualiza o original
  await actor.updateEmbeddedDocuments("Item", [{
    _id: item.id,
    "system.ammo_quantity": remainder
  }]);

  // Clona o item
  const newItem = foundry.utils.duplicate(item);
  newItem.system.ammo_quantity = newQty;
  delete newItem._id;

  // Marca com noAutoStack e originalStackId
  newItem.flags = {
    ...item.flags,
    tm: {
      ...(item.flags?.tm ?? {}),
      noAutoStack: true,
      originalStackId: item.flags?.tm?.originalStackId || item.id
    }
  };

  // Cria o item novo
  const [created] = await actor.createEmbeddedDocuments("Item", [newItem]);

  console.log(`[STACK] ${item.name} dividido: ${remainder} + ${newQty}`);
  console.log(`[DEBUG] Novos IDs: ${item.id}, ${created.id}`);

  // ⛔ Garante que o novo item não stacke automaticamente ao ser posicionado
  await created.update({ "flags.tm.noAutoStack": true });

  // ✅ Força revalidação do grid real após alteração do original
  await game.tm.GridAutoPosition.placeNewItem(actor, created);
}










  
}
