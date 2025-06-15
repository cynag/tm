// src/gear/gear-constants.js
export const GearConstants = {
  SLOT_WIDTH: 50,
  SLOT_HEIGHT: 50,

  GEAR_SLOT_RULES: {
    slot_head:     { type: "armor", subtype: "head" },
    slot_neck:     { type: "accessory", subtype: "neck" },
    slot_shoulder: { type: "armor", subtype: "shoulder" },
    slot_torso:    { type: "armor", subtype: "torso" },
    slot_legs:     { type: "armor", subtype: "legs" },
    slot_foots:    { type: "armor", subtype: "foots" },
    slot_hands:    { type: "armor", subtype: "hands" },
    slot_ring1:    { type: "accessory", subtype: "ring" },
    slot_ring2:    { type: "accessory", subtype: "ring" },
    slot_back:     { type: "accessory", subtype: "back" },
    slot_waist:    { type: "accessory", subtype: "waist" },
    slot_weapon1:  { type: "weapon" },
    slot_weapon2:  { type: "weapon" }
  },

  GEAR_SLOT_POSITIONS: {
  slot_ring1:    { x: 0, y: 0 },
  slot_ring2:    { x: 0, y: 1 },
  slot_neck:     { x: 1, y: 0 },
  slot_shoulder: { x: 2, y: 0 },
  slot_head:     { x: 4, y: 0 },
  slot_back:     { x: 6, y: 0 },
  slot_hands:    { x: 8, y: 0 },
  slot_weapon1:  { x: 0, y: 2 },
  slot_legs:     { x: 2, y: 2 },
  slot_torso:    { x: 4, y: 2 },
  slot_waist:    { x: 6, y: 2 },
  slot_foots:    { x: 6, y: 3 },
  slot_weapon2:  { x: 8, y: 2 }
},

SLOT_LAYOUT: {
  slot_ring1:    { x: 0, y: 0, w: 1, h: 1 },
  slot_ring2:    { x: 0, y: 1, w: 1, h: 1 },
  slot_neck:     { x: 1, y: 0, w: 1, h: 2 },
  slot_shoulder: { x: 2, y: 0, w: 2, h: 2 },
  slot_head:     { x: 4, y: 0, w: 2, h: 2 },
  slot_back:     { x: 6, y: 0, w: 2, h: 2 },
  slot_hands:    { x: 8, y: 0, w: 2, h: 2 },
  slot_weapon1:  { x: 0, y: 2, w: 2, h: 3 },
  slot_legs:     { x: 2, y: 2, w: 2, h: 3 },
  slot_torso:    { x: 4, y: 2, w: 2, h: 3 },
  slot_waist:    { x: 6, y: 2, w: 2, h: 1 },
  slot_foots:    { x: 6, y: 3, w: 2, h: 2 },
  slot_weapon2:  { x: 8, y: 2, w: 2, h: 3 }
}

};
