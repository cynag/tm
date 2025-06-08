import { InventoryGridManager } from "./inventory-grid-manager.js";
export class TMActor extends Actor {

  prepareBaseData() {
    super.prepareBaseData();

    const data = this.system;
    data.hp_value = data.hp_value || { value: 0, max: 0 };
    data.ap_value = data.ap_value || { value: 0, max: 0 };
  }

  // 🚀 INTERCEPTA DROP DE ITEM EXTERNO
  async onDropItem(event, data) {
    console.log("[TM1E] onDropItem chamado!", data);

    const item = await fromUuid(data.uuid);
    if (!item) {
      console.warn("[TM1E] UUID inválido ou item não encontrado.");
      return;
    }

    const itemData = item.toObject();
    console.log("[TM1E] itemData resolvido a partir do UUID:", itemData);
    console.log(`[DEBUG][onDropItem] BEFORE placement → ${itemData.name} gridW=${itemData.system.gridWidth}, gridH=${itemData.system.gridHeight}`);

    const isPhysical = ["object", "weapon", "armor", "potion", "food"].includes(itemData.type);
    console.log(`[TM1E] Item type: ${itemData.type} → Físico: ${isPhysical}`);

    if (!isPhysical) {
      console.log("[TM1E] Item não físico → usando super.onDropItem");
      return super.onDropItem(event, data);
    }

    // Garante campos de grid
    itemData.system.gridWidth = itemData.system.gridWidth ?? 1;
    itemData.system.gridHeight = itemData.system.gridHeight ?? 1;

    const itemWidth = itemData.system.gridWidth;
    const itemHeight = itemData.system.gridHeight;

    console.log(`[TM1E] Tentando colocar item ${itemData.name} → ${itemWidth}x${itemHeight}`);

    // Usa InventoryGridManager para buscar espaço
    const gridManager = new InventoryGridManager();
    const freeSlot = gridManager.findFirstFreePosition(this, itemWidth, itemHeight);

    if (!freeSlot) {
      console.warn("[TM1E] Nenhum slot livre encontrado. Item NÃO será criado.");
      ui.notifications.warn(`Sem espaço no inventário para ${itemData.name}.`);
      return;
    }

    // Cria o item
    const itemSource = {
      name: itemData.name,
      type: itemData.type,
      img: itemData.img,
      system: {
        ...itemData.system,
        gridX: freeSlot.x,
        gridY: freeSlot.y
      }
    };

    console.log(`[TM1E] Criando item: ${itemSource.name} em gridX=${freeSlot.x}, gridY=${freeSlot.y}`);

    await this.createEmbeddedDocuments("Item", [itemSource]);

    console.log(`[DEBUG][onDropItem] FINAL → creating item ${itemSource.name} at X=${itemSource.system.gridX}, Y=${itemSource.system.gridY}, W=${itemSource.system.gridWidth}, H=${itemSource.system.gridHeight}`);

    console.log(`[TM1E] Item criado com sucesso!`);

    this.render();
    return;
  }

}
