import { InventoryGrid } from "./inventory-grid.js";

export class TMActor extends Actor {

  prepareBaseData() {
    super.prepareBaseData();
    console.log(`[TMActor] prepareBaseData para ${this.name}`);
  }

  async onDropItem(event, data) {
    console.log("[TMActor] onDropItem chamado!", data);

    const item = await fromUuid(data.uuid);
    if (!item) return;

    console.log(`[TMActor] Item type: ${item.type} → Físico: ${item.type === "object"}`);

    if (item.type !== "object") {
      console.warn(`[TMActor] Tipo de item não suportado: ${item.type}`);
      return;
    }

    console.log(`[TMActor] Tentando colocar item ${item.name} ${item.system.gridWidth}x${item.system.gridHeight}`);

    const newPos = InventoryGrid.findFirstFreePosition(this, item.system.gridWidth, item.system.gridHeight);

    if (!newPos) {
      console.warn(`[TMActor] Não há espaço para ${item.name}`);
      return;
    }

    await this.createEmbeddedDocuments("Item", [{
      name: item.name,
      img: item.img,
      type: item.type,
      system: {
        ...item.system,
        gridX: newPos.x,
        gridY: newPos.y
      }
    }]);

    console.log(`[TMActor] Item ${item.name} criado em X=${newPos.x}, Y=${newPos.y}`);
  }
}
