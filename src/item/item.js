export class TMObject extends Item {
  prepareBaseData() {
    super.prepareBaseData();

    const data = this.system;

    if (!data.grid) data.grid = {};
    if (!Number.isInteger(data.grid.w) || data.grid.w < 1) data.grid.w = 1;
    if (!Number.isInteger(data.grid.h) || data.grid.h < 1) data.grid.h = 1;

    //console.log(`[TMObject] prepareBaseData for ${this.name} | size: ${data.grid.w}x${data.grid.h}`);
  }
}
