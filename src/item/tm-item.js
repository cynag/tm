export class TMItem extends Item {
  prepareData() {
    super.prepareData();
    console.log("🛠️ [TMItem] prepareData | Item:", this.name);
  }
}
