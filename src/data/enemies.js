// 敌人数据：为现有剧本兜底（不新增剧情，仅为系统服务）
// 数据驱动，可在剧本场景的 triggerEvent.enemy 中引用
export const enemies = {
  // 怨灵：医院中徘徊的低阶亡灵
  'ghost-01': {
    id: 'ghost-01',
    name: '怨灵',
    type: 'undead',
    hp: 22,
    maxHp: 22,
    attack: 6,
    defense: 12,
    agility: 8,
    skills: [],
    expReward: 100,
    sanDamage: 2,
    description: '一团扭曲的苍白雾气，散发着令人毛骨悚然的寒意...'
  },

  // 被附身的女人：剧本 scene-3a 的关键战斗
  'possessed-woman': {
    id: 'possessed-woman',
    name: '被附身的李雨桐',
    type: 'possessed',
    hp: 45,
    maxHp: 45,
    attack: 9,
    defense: 14,
    agility: 10,
    skills: [],
    expReward: 250,
    sanDamage: 4,
    description: '她的眼睛空洞无神，扭曲的躯体里盘踞着邪恶的力量。'
  },

  // 黑暗仪式残留：备用的精英敌人
  'shadow-remnant': {
    id: 'shadow-remnant',
    name: '暗影残渣',
    type: 'shadow',
    hp: 30,
    maxHp: 30,
    attack: 7,
    defense: 13,
    agility: 12,
    skills: [],
    expReward: 150,
    sanDamage: 3,
    description: '十年前失败仪式遗留的纯粹黑暗能量...'
  }
}

export function getEnemy(enemyId) {
  return enemies[enemyId] ? { ...enemies[enemyId] } : null
}

// 将 triggerEvent.enemy 的字符串 id 解析为完整的敌人对象数组
export function resolveEnemies(enemyRef) {
  if (!enemyRef) return []
  if (Array.isArray(enemyRef)) {
    return enemyRef.map(getEnemy).filter(Boolean)
  }
  const resolved = getEnemy(enemyRef)
  return resolved ? [resolved] : []
}
