// src/item/trait-sheet.js
export class TraitSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "item"],
      template: "systems/tm/templates/item/trait-sheet.hbs",
      width: 400,
      height: 500
    });
  }

  getData() {
    const data = super.getData();
    data.item = this.item;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".trait-tag-add").on("click", async () => {
      const tags = foundry.utils.duplicate(this.item.system.tags || []);
      tags.push({ tag_name: "", tag_description: "" });
      await this.item.update({ "system.tags": tags });
    });

    html.find(".trait-tag-remove").on("click", async (ev) => {
      const index = Number(ev.currentTarget.closest(".trait-tag-entry")?.dataset.tagIndex);
      if (isNaN(index)) return;
      const tags = foundry.utils.duplicate(this.item.system.tags || []);
      tags.splice(index, 1);
      await this.item.update({ "system.tags": tags });
    });

    html.find(".trait-tag-entry input, .trait-tag-entry textarea").on("change", async (ev) => {
      const index = Number(ev.currentTarget.closest(".trait-tag-entry")?.dataset.tagIndex);
      const field = ev.currentTarget.name;
      const value = ev.currentTarget.value;
      if (isNaN(index)) return;

      const tags = foundry.utils.duplicate(this.item.system.tags || []);
      tags[index][field] = value;
      await this.item.update({ "system.tags": tags });
    });
  }
}
