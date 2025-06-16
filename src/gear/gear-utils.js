import { GearConstants } from "./gear-constants.js";

export class GearUtils {
  static isValidForSlot(item, slotId) {
    const rule = GearConstants.GEAR_SLOT_RULES[slotId];
    if (!rule) return false;
    if (item.type !== "gear") return false;
if (rule.type && item.system.gear_type !== rule.type) return false;
if (rule.subtype && item.system.subtype !== rule.subtype) return false;

    return true;
  }
}
