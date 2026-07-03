import { ref } from 'vue';
import { diceService } from '../services/DiceService';

export function useDice() {
  const isRolling = ref(false);
  const lastResult = ref(null);
  
  async function rollD20() {
    isRolling.value = true;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = diceService.rollD20();
    lastResult.value = result;
    isRolling.value = false;
    
    return result;
  }
  
  async function rollSkillCheck(attributeValue, difficulty, options = {}) {
    isRolling.value = true;
    
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const result = diceService.skillCheck(
      attributeValue,
      difficulty,
      options.advantage,
      options.disadvantage
    );
    
    lastResult.value = {
      value: result.value,
      isCritical: result.isCritical,
      isFumble: result.isFumble
    };
    
    isRolling.value = false;
    
    return result;
  }
  
  function rollDamage(diceCount, diceType) {
    return diceService.rollDamage(diceCount, diceType);
  }
  
  function rollD6() {
    return diceService.rollD6();
  }
  
  function rollD8() {
    return diceService.rollD8();
  }
  
  function rollD10() {
    return diceService.rollD10();
  }
  
  function rollD12() {
    return diceService.rollD12();
  }
  
  return {
    rollD20,
    rollSkillCheck,
    rollDamage,
    rollD6,
    rollD8,
    rollD10,
    rollD12,
    isRolling,
    lastResult
  };
}
