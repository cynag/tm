export class CardSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item", "card"],
      width: 500,
      height: 400,
      resizable: false,
      template: "systems/tm/templates/item/card-sheet.hbs",
    });
  }

  async getData(options) {
  const data = await super.getData(options);

  data.attrs = [
  { value: "letality", label: "LET" },
  { value: "dexterity", label: "DES" },
  { value: "impulse", label: "IMP" },
  { value: "arcana", label: "ARC" },
  { value: "erudition", label: "ERU" },
  { value: "virtue", label: "VIR" }
];


  return data;
}


  activateListeners(html) {
    super.activateListeners(html);
  }
}
