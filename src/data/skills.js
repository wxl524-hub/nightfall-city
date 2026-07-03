export const classSkills = {
  investigator: {
    id: 'insight',
    name: '洞察',
    description: '你集中精神观察敌人，发现其弱点。下一次攻击造成50%额外伤害。',
    type: 'buff',
    sanCost: 3,
    cooldown: 2,
    effect: {
      type: 'damage_bonus',
      value: 1.5,
      duration: 1
    }
  },
  medium: {
    id: 'summon_spirit',
    name: '招魂',
    description: '你召唤一个亡灵协助战斗，对敌人造成10-15点伤害。',
    type: 'attack',
    sanCost: 5,
    cooldown: 3,
    effect: {
      type: 'damage',
      min: 10,
      max: 15
    }
  },
  mage: {
    id: 'shadow_bolt',
    name: '暗影箭',
    description: '发射一支暗影箭，造成15-20点魔法伤害。',
    type: 'magic',
    sanCost: 4,
    cooldown: 1,
    effect: {
      type: 'damage',
      min: 15,
      max: 20
    }
  },
  hunter: {
    id: 'trap',
    name: '陷阱',
    description: '布置一个陷阱，定身敌人一回合并造成5点伤害。',
    type: 'control',
    sanCost: 2,
    cooldown: 2,
    effect: {
      type: 'damage',
      value: 5,
      stun: true
    }
  }
};

export function getClassSkill(classId) {
  return classSkills[classId] || null;
}