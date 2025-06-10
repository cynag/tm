export class DragManager {
  static onDragStart(event, item) {
    console.log(`[DragManager] Início do drag para ${item.name}`);
    // armazenar dados temporários para drag
  }

  static onDrop(event, actor) {
    console.log("[DragManager] Drop detectado.");
    // calcular posição e tentar inserir
  }
}
