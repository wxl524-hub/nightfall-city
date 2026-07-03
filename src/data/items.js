// 道具数据：为现有剧本/战斗兜底（不新增剧情，仅为系统服务）
// effect.type: heal | damage | sanity_restore | buff | utility
export const items = {
  // ===== 剧情关键道具 =====
  'purification-ritual': {
    id: 'purification-ritual',
    name: '净化仪式手稿',
    description: '张明远医生记录的净化仪式步骤，或许能拯救李雨桐的灵魂。',
    type: 'key',
    icon: '📜',
    usable: false,
    effect: null
  },
  'purification-ritual-improved': {
    id: 'purification-ritual-improved',
    name: '改进版净化仪式',
    description: '附加了失败原因分析的净化仪式，成功率更高。',
    type: 'key',
    icon: '📑',
    usable: false,
    effect: null
  },
  'hospital-records': {
    id: 'hospital-records',
    name: '医院档案',
    description: '一份记录着圣玛丽医院秘密的档案文件。',
    type: 'key',
    icon: '🗂️',
    usable: false,
    effect: null
  },

  // ===== 武器/装备 =====
  'iron-pipe': {
    id: 'iron-pipe',
    name: '生锈的铁管',
    description: '入口旁捡到的生锈铁管，可以用来防身。',
    type: 'weapon',
    icon: '🦯',
    usable: false,
    equip: { attackBonus: 2 },
    effect: null
  },

  // ===== 消耗品（战斗/探索中可用）=====
  'health-potion': {
    id: 'health-potion',
    name: '治疗药水',
    description: '恢复 20 点生命值。',
    type: 'consumable',
    icon: '🧪',
    usable: true,
    effect: { type: 'heal', value: 20 }
  },
  'sanity-tonic': {
    id: 'sanity-tonic',
    name: '镇定剂',
    description: '恢复 8 点理智值。',
    type: 'consumable',
    icon: '💉',
    usable: true,
    effect: { type: 'sanity_restore', value: 8 }
  },
  'holy-water': {
    id: 'holy-water',
    name: '圣水',
    description: '驱魔师的圣水，恢复生命值并净化心灵（治疗15，恢复5理智）。',
    type: 'consumable',
    icon: '💧',
    usable: true,
    effect: { type: 'heal_and_sanity', heal: 15, sanity: 5 }
  }
}

export function getItem(itemId) {
  return items[itemId] ? { ...items[itemId] } : null
}
