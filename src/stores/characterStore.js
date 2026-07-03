import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getClassSkill } from '../data/skills';
import { getItem } from '../data/items';

export const useCharacterStore = defineStore('character', () => {
  const character = ref(null);

  // ===== Getters =====
  const currentHp = computed(() => character.value?.hp ?? 0);
  const maxHp = computed(() => character.value?.maxHp ?? 0);
  const hpPercentage = computed(() => {
    if (!character.value || !maxHp.value) return 0;
    return Math.round((character.value.hp / character.value.maxHp) * 100);
  });

  const level = computed(() => character.value?.level ?? 1);
  const experience = computed(() => character.value?.experience ?? 0);
  const expToNextLevel = computed(() => {
    if (!character.value) return 100;
    return character.value.level * 100;
  });
  const expPercentage = computed(() => {
    if (!character.value || !expToNextLevel.value) return 0;
    return Math.round((character.value.experience / expToNextLevel.value) * 100);
  });

  const currentSan = computed(() => character.value?.san ?? 0);
  const maxSan = computed(() => character.value?.maxSan ?? 30);
  const sanPercentage = computed(() => {
    if (!character.value || !maxSan.value) return 0;
    return Math.round((character.value.san / character.value.maxSan) * 100);
  });
  const isInsane = computed(() => (character.value?.san ?? 0) <= 0);

  // ===== Actions =====
  function createCharacter(data) {
    const maxSanValue = calculateMaxSan(data.class, data.attributes);
    const classSkill = getClassSkill(data.class);
    const initialSkills = classSkill ? [{ ...classSkill, currentCooldown: 0 }] : [];

    character.value = {
      id: crypto.randomUUID(),
      name: data.name,
      class: data.class,
      attributes: { ...data.attributes },
      skills: initialSkills,
      activeEffects: [],
      hp: calculateMaxHp(data.class, data.attributes),
      maxHp: calculateMaxHp(data.class, data.attributes),
      san: maxSanValue,
      maxSan: maxSanValue,
      inventory: [],
      background: data.background,
      level: 1,
      experience: 0
    };
  }

  function updateCharacter(updates) {
    if (character.value) {
      character.value = { ...character.value, ...updates };
    }
  }

  function modifyAttribute(attr, value) {
    if (character.value) {
      character.value.attributes[attr] = value;
    }
  }

  function addSkill(skill) {
    if (character.value && !character.value.skills.find(s => s.id === skill.id)) {
      character.value.skills.push({ ...skill, currentCooldown: 0 });
    }
  }

  function removeSkill(skillId) {
    if (character.value) {
      character.value.skills = character.value.skills.filter(s => s.id !== skillId);
    }
  }

  function takeDamage(amount) {
    if (character.value) {
      character.value.hp = Math.max(0, character.value.hp - amount);
    }
  }

  function heal(amount) {
    if (character.value) {
      character.value.hp = Math.min(character.value.maxHp, character.value.hp + amount);
    }
  }

  function addItem(item, quantity = 1) {
    if (!character.value) return;
    if (!character.value.inventory) character.value.inventory = [];
    const existingItem = character.value.inventory.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      character.value.inventory.push({ ...item, quantity });
    }
  }

  // 直接按 id 增加道具（供剧本 bonus / 探索奖励使用）
  function addItemById(itemId, quantity = 1) {
    const item = getItem(itemId);
    if (item) addItem(item, quantity);
    return !!item;
  }

  function removeItem(itemId) {
    if (character.value) {
      character.value.inventory = character.value.inventory.filter(i => i.id !== itemId);
    }
  }

  function useItem(itemId) {
    if (!character.value) return false;
    const item = character.value.inventory.find(i => i.id === itemId);
    if (!item || !item.effect) return false;

    const applied = applyItemEffect(item);
    if (applied) {
      item.quantity--;
      if (item.quantity <= 0) {
        removeItem(itemId);
      }
    }
    return applied;
  }

  function gainExperience(amount) {
    if (!character.value) return;
    character.value.experience += amount;
    checkLevelUp();
  }

  function sanityDamage(amount) {
    if (character.value) {
      character.value.san = Math.max(0, character.value.san - amount);
    }
  }

  function restoreSanity(amount) {
    if (character.value) {
      character.value.san = Math.min(character.value.maxSan, character.value.san + amount);
    }
  }

  function resetCharacter() {
    character.value = null;
  }

  function setCharacter(char) {
    character.value = char;
  }

  // ===== 内部辅助（放在 store 工厂内，可访问 character / 自身方法）=====
  function applyItemEffect(item) {
    if (!item.effect) return false;
    const eff = item.effect;
    switch (eff.type) {
      case 'heal':
        heal(eff.value);
        return true;
      case 'damage':
        takeDamage(eff.value);
        return true;
      case 'sanity_restore':
        restoreSanity(eff.value);
        return true;
      case 'heal_and_sanity':
        heal(eff.heal);
        restoreSanity(eff.sanity);
        return true;
      default:
        return false;
    }
  }

  function checkLevelUp() {
    if (!character.value) return;

    // 支持连续升级
    while (
      character.value.experience >= character.value.level * 100 &&
      character.value.level < 99
    ) {
      const requiredExp = character.value.level * 100;
      character.value.level++;
      character.value.experience -= requiredExp;
      character.value.maxHp += 10;
      character.value.maxSan += 3;
      character.value.hp = character.value.maxHp;
      character.value.san = character.value.maxSan;

      const classBonus = getClassLevelBonus(character.value.class);
      Object.keys(character.value.attributes).forEach(attr => {
        character.value.attributes[attr] += classBonus[attr] ?? 1;
      });
    }
  }

  return {
    character,
    currentHp,
    maxHp,
    hpPercentage,
    currentSan,
    maxSan,
    sanPercentage,
    isInsane,
    level,
    experience,
    expToNextLevel,
    expPercentage,
    createCharacter,
    updateCharacter,
    modifyAttribute,
    addSkill,
    removeSkill,
    takeDamage,
    heal,
    sanityDamage,
    restoreSanity,
    addItem,
    addItemById,
    removeItem,
    useItem,
    gainExperience,
    resetCharacter,
    setCharacter
  };
});

// ===== 纯函数（不依赖 store 实例）=====
function calculateMaxHp(characterClass, attributes) {
  const baseHpByClass = {
    hunter: 40,
    investigator: 30,
    medium: 25,
    mage: 20
  };
  const baseHp = baseHpByClass[characterClass] ?? 30;
  const constitutionBonus = Math.floor((attributes.strength + attributes.willpower) / 4);
  return baseHp + constitutionBonus;
}

function calculateMaxSan(characterClass, attributes) {
  const baseSanByClass = {
    hunter: 30,
    investigator: 35,
    medium: 25,
    mage: 40
  };
  const baseSan = baseSanByClass[characterClass] ?? 30;
  const willpowerBonus = Math.floor(attributes.willpower / 2);
  return baseSan + willpowerBonus;
}

function getClassLevelBonus(className) {
  const bonuses = {
    investigator: { intelligence: 2, perception: 2 },
    medium: { willpower: 2, charisma: 2 },
    mage: { intelligence: 2, willpower: 2 },
    hunter: { strength: 2, agility: 2 }
  };
  return bonuses[className] || {};
}
