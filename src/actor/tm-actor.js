export class TMActor extends Actor {
  prepareData() {
    super.prepareData();
    console.log("🛠️ [TMActor] prepareData | Actor:", this.name);
  }
}
