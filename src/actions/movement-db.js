export const MovementDB = [
  {
    id: "move_short",
    name: "Curto",
    cost: 2,
    scale: 0.5,
    img: "systems/tm/styles/assets/actions/move-1.webp",
    description: "Você se move com cautela por até <strong>{meters} metros</strong>, tentando não chamar atenção."
  },
  {
    id: "move_standard",
    name: "Padrão",
    cost: 4,
    scale: 1,
    img: "systems/tm/styles/assets/actions/move-2.webp",
    description: "Você se move normalmente por até <strong>{meters} metros</strong>, em qualquer direção."
  },
  {
    id: "move_dash",
    name: "Disparada",
    cost: 6,
    scale: 2,
    img: "systems/tm/styles/assets/actions/move-3.webp",
    description: "Você avança com pressa por até <strong>{meters} metros</strong>, abrindo mão de defesas."
  }
];
