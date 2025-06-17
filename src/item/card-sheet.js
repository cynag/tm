const { ItemSheet } = foundry.appv1.sheets;

export class CardSheet extends ItemSheet {
  get template() {
    return "systems/tm/templates/item/card-sheet.hbs";
  }

  getData() {
    const data = super.getData();
    data.attrs = ["letality", "dexterity", "impulse", "arcana", "erudition", "virtue"];
    return data;
  }
}
