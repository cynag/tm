export class TMActor extends Actor {
  prepareBaseData() {
  super.prepareBaseData();

  this.system.gearSlots = foundry.utils.mergeObject({
  slot_head:     { itemId: null, width: 3, height: 3 },
  slot_neck:     { itemId: null, width: 1, height: 2 },
  slot_shoulder: { itemId: null, width: 3, height: 3 },
  slot_torso:    { itemId: null, width: 3, height: 4 },
  slot_legs:     { itemId: null, width: 3, height: 4 },
  slot_foots:    { itemId: null, width: 3, height: 3 },
  slot_hands:    { itemId: null, width: 3, height: 3 },
  slot_ring1:    { itemId: null, width: 1, height: 1 },
  slot_ring2:    { itemId: null, width: 1, height: 1 },
  slot_back:     { itemId: null, width: 3, height: 4 },
  slot_waist:    { itemId: null, width: 3, height: 1 },
  slot_weapon1:  { itemId: null, width: 5, height: 4 },
  slot_weapon2:  { itemId: null, width: 5, height: 4 }
}, this.system.gearSlots || {}, { inplace: false });

}
}
