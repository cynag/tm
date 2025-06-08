export class TMActor extends Actor {

  prepareBaseData() {
    super.prepareBaseData();

    const data = this.system;
    data.hp_value = data.hp_value || { value: 0, max: 0 };
    data.ap_value = data.ap_value || { value: 0, max: 0 };
  }

  // 🚀 AUTO-PLACEMENT - FIND FIRST FREE SLOT
  async findFirstFreeSlot(itemWidth, itemHeight) {
    const maxW = 10;
    const maxH = 10;

    console.log(`[AUTO-PLACE] Procurando espaço para item ${itemWidth}x${itemHeight}`);

    const grid = Array.from({ length: maxH }, () =>
      Array.from({ length: maxW }, () => false)
    );

    for (const i of this.items) {
      const ix = i.system.gridX;
      const iy = i.system.gridY;
      const iw = i.system.gridWidth;
      const ih = i.system.gridHeight;

      for (let y = iy; y < iy + ih; y++) {
        for (let x = ix; x < ix + iw; x++) {
          if (y >= 0 && y < maxH && x >= 0 && x < maxW) {
            grid[y][x] = true;
          }
        }
      }
    }

    for (let y = 0; y <= maxH - itemHeight; y++) {
      for (let x = 0; x <= maxW - itemWidth; x++) {

        let fits = true;

        for (let yy = 0; yy < itemHeight; yy++) {
          for (let xx = 0; xx < itemWidth; xx++) {
            if (grid[y + yy][x + xx]) {
              fits = false;
              break;
            }
          }
          if (!fits) break;
        }

        if (fits) {
          console.log(`[AUTO-PLACE] Slot livre encontrado: gridX=${x}, gridY=${y}`);
          return { gridX: x, gridY: y };
        }
      }
    }

    console.warn("[AUTO-PLACE] Inventário cheio! Não foi possível adicionar o item.");
    return null;
  }

  // 🚀 INTERCEPTA DROP DE ITEM EXTERNO (Sidebar, Compendium, etc)
  async onDropItem(event, data) {
    console.log("[TM1E] onDropItem chamado!", data);

    const item = await fromUuid(data.uuid);
    if (!item) {
      console.warn("[TM1E] UUID inválido ou item não encontrado.");
      return;
    }

    const itemData = item.toObject();
    console.log("[TM1E] itemData resolvido a partir do UUID:", itemData);

    const isPhysical = ["object", "weapon", "armor", "potion", "food"].includes(itemData.type);
    console.log(`[TM1E] Item type: ${itemData.type} → Físico: ${isPhysical}`);

    if (!isPhysical) {
      console.log("[TM1E] Item não físico → usando super.onDropItem");
      return super.onDropItem(event, data);
    }

    // Garante campos de grid
    itemData.system.gridWidth = itemData.system.gridWidth ?? 1;
    itemData.system.gridHeight = itemData.system.gridHeight ?? 1;

    let itemWidth = itemData.system.gridWidth;
    let itemHeight = itemData.system.gridHeight;

    console.log(`[TM1E] Tentando colocar item ${itemData.name} → ${itemWidth}x${itemHeight}`);

    // Tenta vertical
    let freeSlot = await this.findFirstFreeSlot(itemWidth, itemHeight);

    // Se não achou → tenta rotacionado
    if (!freeSlot) {
      console.log(`[TM1E] Não coube na vertical → tentando ROTACIONADO`);
      const rotatedWidth = itemHeight;
      const rotatedHeight = itemWidth;
      freeSlot = await this.findFirstFreeSlot(rotatedWidth, rotatedHeight);

      if (freeSlot) {
        console.log(`[TM1E] Achou espaço ROTACIONADO em gridX=${freeSlot.gridX}, gridY=${freeSlot.gridY}`);
        itemWidth = rotatedWidth;
        itemHeight = rotatedHeight;
        itemData.system.rotated = true;
      }
    }

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
        gridX: freeSlot.gridX,
        gridY: freeSlot.gridY,
        gridWidth: itemWidth,
        gridHeight: itemHeight
      }
    };

    console.log(`[TM1E] Criando item: ${itemSource.name} em gridX=${freeSlot.gridX}, gridY=${freeSlot.gridY}`);

    await this.createEmbeddedDocuments("Item", [itemSource]);

    console.log(`[TM1E] Item criado com sucesso!`);

    this.render();
    return;
  }

}