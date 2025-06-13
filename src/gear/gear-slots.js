// src/gear/gear-slots.js
import { GearConstants } from "./gear-constants.js";

export const GearSlots = Object.entries(GearConstants.SLOT_LAYOUT).map(([id, data]) => {
  return {
    id,
    x: data.x,
    y: data.y,
    w: data.w,
    h: data.h,
    itemId: null
  };
});