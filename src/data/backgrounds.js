export const backgrounds = {
  detective: {
    id: 'detective',
    name: '私家侦探',
    description: '曾是警探，因调查超自然事件被开除',
    skill: '敏锐观察',
    skillDescription: '在调查场景中获得+2感知加成',
    icon: '🔍'
  },
  occultist: {
    id: 'occultist',
    name: '神秘学者',
    description: '研究黑暗魔法与禁忌知识',
    skill: '神秘学识',
    skillDescription: '在魔法相关场景中获得+2智力加成',
    icon: '📜'
  },
  survivor: {
    id: 'survivor',
    name: '幸存者',
    description: '曾遭遇超自然事件并活了下来',
    skill: '求生本能',
    skillDescription: '在危险场景中获得+2意志加成',
    icon: '🔥'
  },
  reporter: {
    id: 'reporter',
    name: '调查记者',
    description: '专门揭露都市传说背后的真相',
    skill: '口才',
    skillDescription: '在对话场景中获得+2魅力加成',
    icon: '📰'
  },
  doctor: {
    id: 'doctor',
    name: '法医',
    description: '在停尸房见过太多不可思议的事情',
    skill: '医学知识',
    skillDescription: '在检查尸体或伤口时获得+2智力加成',
    icon: '⚕️'
  },
  exorcist: {
    id: 'exorcist',
    name: '驱魔师',
    description: '来自教会的神圣战士',
    skill: '神圣庇护',
    skillDescription: '对抗恶魔或亡灵时获得+2意志加成',
    icon: '✝️'
  }
};

export function getBackgroundBonus(backgroundId, checkType) {
  const background = backgrounds[backgroundId];
  if (!background) return 0;
  
  switch (checkType) {
    case 'investigation':
      if (backgroundId === 'detective') return 2;
      if (backgroundId === 'reporter') return 1;
      break;
    case 'magic':
      if (backgroundId === 'occultist') return 2;
      if (backgroundId === 'exorcist') return 1;
      break;
    case 'survival':
      if (backgroundId === 'survivor') return 2;
      if (backgroundId === 'doctor') return 1;
      break;
    case 'conversation':
      if (backgroundId === 'reporter') return 2;
      if (backgroundId === 'detective') return 1;
      break;
    case 'medical':
      if (backgroundId === 'doctor') return 2;
      if (backgroundId === 'occultist') return 1;
      break;
    case 'holy':
      if (backgroundId === 'exorcist') return 2;
      if (backgroundId === 'survivor') return 1;
      break;
  }
  return 0;
}
