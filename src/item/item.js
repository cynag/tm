export class TMObject extends Item {
  prepareBaseData() {
    super.prepareBaseData();
    console.log(`[TMObject] prepareBaseData para ${this.name}`);
  }
}
