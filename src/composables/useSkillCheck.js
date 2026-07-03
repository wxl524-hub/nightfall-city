import { ref } from 'vue';
import { diceService } from '../services/DiceService';
import { useCharacterStore } from '../stores/characterStore';
import { useGameStore } from '../stores/gameStore';
import { getBackgroundBonus } from '../data/backgrounds';

/**
 * 技能检定组合式函数
 * - 整合属性值 + 背景加成 + 优劣势
 * - 提供 performCheck 用于剧本选项检定，返回结构化结果
 */
export function useSkillCheck() {
  const isChecking = ref(false);

  /**
   * @param {Object} requirement { attribute, dc, checkType? }
   * @param {Object} options { advantage?, disadvantage? }
   * @returns {Object} { success, value, attribute, bonus, total, dc, isCritical, isFumble, margin }
   */
  function performCheck(requirement, options = {}) {
    if (!requirement) return null;

    const characterStore = useCharacterStore();
    const gameStore = useGameStore();
    const character = characterStore.character;

    const attributeName = requirement.attribute;
    const baseValue = character?.attributes?.[attributeName] ?? 0;
    const background = character?.background;
    const checkType = requirement.checkType || attributeName;

    // 背景加成
    const backgroundBonus = getBackgroundBonus(background, checkType);
    const attributeValue = baseValue + backgroundBonus;

    // 掷骰（带优劣势）
    let roll;
    if (options.advantage && !options.disadvantage) {
      roll = diceService.rollWithAdvantage();
    } else if (options.disadvantage && !options.advantage) {
      roll = diceService.rollWithDisadvantage();
    } else {
      roll = diceService.rollD20();
    }

    const dc = requirement.dc ?? 10;
    const total = roll.value + attributeValue;
    const naturalSuccess = roll.isCritical;
    const naturalFail = roll.isFumble;
    const success = naturalSuccess || (!naturalFail && total >= dc);

    gameStore.recordSkillCheck(success);

    return {
      success,
      value: roll.value,
      isCritical: roll.isCritical,
      isFumble: roll.isFumble,
      attributeName,
      attributeValue,
      baseValue,
      backgroundBonus,
      total,
      dc,
      margin: success ? total - dc : dc - total
    };
  }

  /**
   * 异步版本：带掷骰动画延迟
   */
  async function performCheckAnimated(requirement, options = {}) {
    isChecking.value = true;
    await new Promise(resolve => setTimeout(resolve, 700));
    const result = performCheck(requirement, options);
    isChecking.value = false;
    return result;
  }

  return {
    isChecking,
    performCheck,
    performCheckAnimated
  };
}
