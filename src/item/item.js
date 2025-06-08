export class TMObject extends Item {
  prepareBaseData() {
  super.prepareBaseData();

  const data = this.system;
  
  data.gridWidth = data.gridWidth ?? 1;
  data.gridHeight = data.gridHeight ?? 1;
  
  data.gridX = Number.isInteger(data.gridX) ? data.gridX : 0;
  data.gridY = Number.isInteger(data.gridY) ? data.gridY : 0;
  
  data.rotated = data.rotated ?? false;
  //console.log(`[DEBUG][prepareBaseData] ${this.name} → gridX=${data.gridX}, gridY=${data.gridY}, gridW=${data.gridWidth}, gridH=${data.gridHeight}, rotated=${data.rotated}`);

}

}
