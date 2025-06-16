export class TMObject extends Item {
  prepareBaseData() {
    super.prepareBaseData();

    const data = this.system;

    // Grid size (já implementado)
    if (!data.grid) data.grid = {};
    if (!Number.isInteger(data.grid.w) || data.grid.w < 1) data.grid.w = 1;
    if (!Number.isInteger(data.grid.h) || data.grid.h < 1) data.grid.h = 1;

    // Valor monetário
    if (typeof data.value !== "number") data.value = 0;

    // Descrição (string)
    if (typeof data.description !== "string") data.description = "";

    // Raridade (comum por padrão)
if (!["common", "uncommon", "rare", "epic"].includes(data.rarity))
  data.rarity = "common";

  }
}
