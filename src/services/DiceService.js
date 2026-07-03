class DiceService {
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  rollD20() {
    const value = this.randomInt(1, 20);
    return {
      value,
      isCritical: value === 20,
      isFumble: value === 1
    };
  }
  
  rollD6() {
    return this.randomInt(1, 6);
  }
  
  rollD8() {
    return this.randomInt(1, 8);
  }
  
  rollD10() {
    return this.randomInt(1, 10);
  }
  
  rollD12() {
    return this.randomInt(1, 12);
  }
  
  rollD100() {
    return this.randomInt(1, 100);
  }
  
  rollWithAdvantage() {
    const roll1 = this.rollD20();
    const roll2 = this.rollD20();
    const value = Math.max(roll1.value, roll2.value);
    return {
      value,
      isCritical: value === 20,
      isFumble: value === 1
    };
  }
  
  rollWithDisadvantage() {
    const roll1 = this.rollD20();
    const roll2 = this.rollD20();
    const value = Math.min(roll1.value, roll2.value);
    return {
      value,
      isCritical: value === 20,
      isFumble: value === 1
    };
  }
  
  skillCheck(attributeValue, difficulty, hasAdvantage = false, hasDisadvantage = false) {
    let roll;
    
    if (hasAdvantage && !hasDisadvantage) {
      roll = this.rollWithAdvantage();
    } else if (hasDisadvantage && !hasAdvantage) {
      roll = this.rollWithDisadvantage();
    } else {
      roll = this.rollD20();
    }
    
    const total = roll.value + attributeValue;
    const success = total >= difficulty;
    
    return {
      ...roll,
      total,
      success,
      difficulty,
      margin: success ? total - difficulty : difficulty - total
    };
  }
  
  rollDamage(diceCount, diceType) {
    let total = 0;
    for (let i = 0; i < diceCount; i++) {
      total += this.randomInt(1, diceType);
    }
    return total;
  }
  
  rollInitiative(agility) {
    return this.rollD20() + agility;
  }
}

export const diceService = new DiceService();
