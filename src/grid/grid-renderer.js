export class GridRenderer {
  static renderGrid(container, gridData) {
    console.log("[GridRenderer] Rendering inventory grid");

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.classList.add("grid-wrapper");

    const grid = document.createElement("div");
    grid.classList.add("grid");
    grid.style.position = "relative";

    const app = Object.values(ui.windows).find(w => w.element?.find("#grid-inventory")[0] === container);
    const actor = app?.actor;

    for (let y = 0; y < gridData.length; y++) {
      for (let x = 0; x < gridData[y].length; x++) {
        const cell = gridData[y][x];
        const div = document.createElement("div");
        div.classList.add("grid-cell");

        if (cell.blocked) div.classList.add("blocked");
        if (cell.occupied) div.classList.add("occupied");
        if (cell.origin) div.classList.add("origin");

        // Hover highlight
        div.addEventListener("mouseenter", () => div.classList.add("hover"));
        div.addEventListener("mouseleave", () => div.classList.remove("hover"));

        grid.appendChild(div);

        // Render image only on origin cell
        if (cell.origin && actor && cell.itemId) {
          const item = actor.items.get(cell.itemId);
          const meta = actor.system.gridInventory.items.find(i => i.id === item.id);

          if (item && meta) {
            const img = document.createElement("img");
            img.src = item.img;
            img.classList.add("grid-item-image");
            img.style.position = "absolute";
            img.style.left = `${x * 50}px`;
            img.style.top = `${y * 50}px`;
            img.style.pointerEvents = "none";
            img.style.objectFit = "cover";
            img.style.zIndex = "5";

            if (meta.rotated) {
              img.style.width = `${meta.h * 50}px`;            // Largura vira altura
              img.style.height = `${meta.w * 50}px`;           // Altura vira largura
              img.style.transform = "rotate(90deg)";
              img.style.transformOrigin = "top left";
              img.style.translate = `${meta.w * 50}px 0px`;     // Corrige para direita

            } else {
              img.style.width = `${meta.w * 50}px`;
              img.style.height = `${meta.h * 50}px`;
            }

            grid.appendChild(img);
          }
        }
      }
    }

    wrapper.appendChild(grid);
    container.appendChild(wrapper);
  }
}