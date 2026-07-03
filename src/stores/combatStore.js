import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import { useCharacterStore } from './characterStore';
import { diceService } from '../services/DiceService';

export const useCombatStore = defineStore('combat', () => {
  const isActive = ref(false);
  const turn = ref(1);
  const phase = ref('INITIATIVE'); // INITIATIVE | PLAYER_TURN | ENEMY_TURN | VICTORY | DEFEAT
  const player = ref(null);
  const enemies = ref([]);
  const log = ref([]);
  const selectedAction = ref(null);
  // 战斗结果信息，供 BattleView 结算使用
  const resultInfo = ref(null);
  // 敌人来源场景，胜利后回到该场景
  const returnSceneId = ref(null);
  // 战斗胜利后推进到的下一个场景
  const nextSceneId = ref(null);

  // ===== Getters =====
  const isPlayerTurn = computed(() => phase.value === 'PLAYER_TURN');
  const aliveEnemies = computed(() => enemies.value.filter(e => e.hp > 0));
  const playerAlive = computed(() => (player.value?.hp ?? 0) > 0);

  // ===== Actions =====
  function startCombat(enemyList, options = {}) {
    isActive.value = true;
    turn.value = 1;
    phase.value = 'INITIATIVE';
    resultInfo.value = null;
    returnSceneId.value = options.returnSceneId ?? null;
    nextSceneId.value = options.nextSceneId ?? null;

    const characterStore = useCharacterStore();
    // 深拷贝角色，避免战斗中的临时状态污染存档；战斗结束再同步回 store
    player.value = characterStore.character
      ? structuredCloneSafe(toRaw(characterStore.character))
      : null;

    enemies.value = enemyList.map(e => ({
      ...e,
      hp: e.maxHp ?? e.hp,
      maxHp: e.maxHp ?? e.hp,
      stunned: false
    }));
    log.value = [];

    resolveInitiative();
  }

  function resolveInitiative() {
    // 简单先攻：玩家先手。后续可改为掷骰比较敏捷。
    phase.value = 'PLAYER_TURN';
    addLogEntry({ actor: '系统', action: '战斗开始！你的回合' });
  }

  function endCombat(victory) {
    isActive.value = false;
    const characterStore = useCharacterStore();

    if (victory) {
      phase.value = 'VICTORY';

      // 同步玩家剩余生命/理智回真实角色
      syncPlayerToCharacter();

      // 结算经验
      const totalExp = enemies.value.reduce((sum, e) => sum + (e.expReward ?? 100), 0);
      characterStore.gainExperience(totalExp);

      // 战斗后回复部分生命
      const damageTaken = player.value.maxHp - player.value.hp;
      const healAmount = Math.floor(damageTaken * 0.3);
      if (healAmount > 0) {
        characterStore.heal(healAmount);
        player.value.hp = Math.min(player.value.maxHp, player.value.hp + healAmount);
      }

      addLogEntry({ actor: '系统', action: `战斗胜利！获得 ${totalExp} 经验值` });
      if (healAmount > 0) {
        addLogEntry({ actor: '系统', action: `恢复 ${healAmount} 点生命值` });
      }

      resultInfo.value = {
        victory: true,
        expGained: totalExp,
        healAmount,
        turn: turn.value
      };
    } else {
      phase.value = 'DEFEAT';
      addLogEntry({ actor: '系统', action: '战斗失败...' });
      resultInfo.value = { victory: false, expGained: 0, turn: turn.value };
    }
  }

  // ===== 玩家行动 =====
  function playerAttack() {
    if (!isPlayerTurn.value || !player.value) return;

    const target = pickTarget();
    if (!target) return;

    const roll = diceService.rollD20();
    const attackBonus = getAttackBonus();
    const total = roll.value + attackBonus;
    const targetDefense = target.defense ?? 10;
    const isHit = total >= targetDefense || roll.isCritical;

    if (isHit) {
      let baseDamage = Math.floor(attackBonus / 2) + 4;
      // 消耗临时伤害增益（damage_bonus）
      const dmgBuffIdx = player.value.activeEffects
        ? player.value.activeEffects.findIndex(eff => eff.type === 'damage_bonus')
        : -1;
      if (dmgBuffIdx !== -1) {
        const buff = player.value.activeEffects[dmgBuffIdx];
        baseDamage = Math.floor(baseDamage * (buff.value ?? 1.5));
        // 单次增益消耗后移除
        if (buff.duration <= 1) {
          player.value.activeEffects.splice(dmgBuffIdx, 1);
        } else {
          buff.duration -= 1;
        }
      }

      const damage = roll.isCritical ? baseDamage * 2 : baseDamage;
      applyDamageToEnemy(target, damage);

      addLogEntry({
        actor: player.value.name,
        action: '攻击',
        target: target.name,
        damage,
        roll: roll.value,
        result: roll.isCritical ? 'critical' : 'hit'
      });

      if (checkCombatEnd()) {
        return;
      }
    } else {
      addLogEntry({
        actor: player.value.name,
        action: '攻击',
        target: target.name,
        roll: roll.value,
        result: 'miss'
      });
    }

    endPlayerTurn();
  }

  function playerDefend() {
    if (!isPlayerTurn.value || !player.value) return;

    // 防御：下回合受到的伤害减半
    if (!player.value.activeEffects) player.value.activeEffects = [];
    player.value.activeEffects.push({
      type: 'damage_reduction',
      value: 0.5,
      duration: 1
    });

    addLogEntry({ actor: player.value.name, action: '摆出防御姿态，下回合减伤50%' });
    endPlayerTurn();
  }

  function playerUseSkill(skillId) {
    if (!isPlayerTurn.value || !player.value) return { ok: false, reason: 'invalid' };

    const skill = player.value.skills.find(s => s.id === skillId);
    if (!skill) return { ok: false, reason: 'no_skill' };

    const characterStore = useCharacterStore();

    if (skill.currentCooldown > 0) {
      addLogEntry({ actor: '系统', action: `${skill.name} 冷却中，还剩 ${skill.currentCooldown} 回合` });
      return { ok: false, reason: 'cooldown' };
    }

    if ((characterStore.currentSan) < skill.sanCost) {
      addLogEntry({ actor: '系统', action: 'San值不足，无法使用技能' });
      return { ok: false, reason: 'san' };
    }

    // 扣除理智（同步回真实角色）
    characterStore.sanityDamage(skill.sanCost);
    player.value.san = Math.max(0, player.value.san - skill.sanCost);

    skill.currentCooldown = skill.cooldown;

    const eff = skill.effect || {};

    if (eff.type === 'damage') {
      const target = pickTarget();
      if (target) {
        const damage =
          eff.min != null && eff.max != null
            ? diceService.randomInt(eff.min, eff.max)
            : eff.value ?? 0;
        applyDamageToEnemy(target, damage);

        addLogEntry({
          actor: player.value.name,
          action: `使用 ${skill.name}`,
          target: target.name,
          damage,
          result: 'hit'
        });

        if (eff.stun) {
          target.stunned = true;
          addLogEntry({ actor: '系统', action: `${target.name} 被定身了！` });
        }

        if (checkCombatEnd()) return { ok: true };
      }
    } else if (eff.type === 'damage_bonus') {
      if (!player.value.activeEffects) player.value.activeEffects = [];
      player.value.activeEffects.push({
        type: 'damage_bonus',
        value: eff.value ?? 1.5,
        duration: eff.duration ?? 1
      });
      addLogEntry({
        actor: player.value.name,
        action: `使用 ${skill.name}，下次攻击伤害提升！`
      });
    }

    endPlayerTurn();
    return { ok: true };
  }

  function playerUseItem(itemId) {
    if (!isPlayerTurn.value || !player.value) return false;

    const characterStore = useCharacterStore();
    const item = characterStore.character?.inventory?.find(i => i.id === itemId);
    if (!item) return false;

    const applied = characterStore.useItem(itemId);
    if (applied) {
      // 同步到战斗内 player 快照
      player.value.hp = characterStore.currentHp;
      player.value.san = characterStore.currentSan;
      addLogEntry({
        actor: player.value.name,
        action: `使用了 ${item.name}`,
        result: 'heal'
      });
      endPlayerTurn();
    }
    return applied;
  }

  // ===== 回合流转 =====
  function endPlayerTurn() {
    phase.value = 'ENEMY_TURN';
    // 留一点时间让 UI 展示
    setTimeout(() => enemyTurn(), 800);
  }

  function enemyTurn() {
    if (!isActive.value) return;
    const characterStore = useCharacterStore();

    aliveEnemies.value.forEach(enemy => {
      if (!playerAlive.value || !player.value) return;
      if (enemy.stunned) {
        enemy.stunned = false;
        addLogEntry({ actor: enemy.name, action: '被定身，无法行动' });
        return;
      }

      const roll = diceService.rollD20();
      const total = roll.value + (enemy.attack ?? 0);
      const playerDefense = (player.value.attributes?.agility ?? 10) + 8;
      const isHit = total >= playerDefense || roll.isCritical;

      if (isHit) {
        let damage = roll.isCritical ? (enemy.attack ?? 0) * 2 : Math.floor((enemy.attack ?? 0) * 0.7) + 2;

        // 防御减伤
        const reduceIdx = player.value.activeEffects
          ? player.value.activeEffects.findIndex(eff => eff.type === 'damage_reduction')
          : -1;
        if (reduceIdx !== -1) {
          const reduce = player.value.activeEffects[reduceIdx];
          damage = Math.floor(damage * (1 - (reduce.value ?? 0.5)));
          if (reduce.duration <= 1) {
            player.value.activeEffects.splice(reduceIdx, 1);
          } else {
            reduce.duration -= 1;
          }
        }

        damage = Math.max(1, damage);
        player.value.hp = Math.max(0, player.value.hp - damage);
        characterStore.takeDamage(damage);

        // 亡灵/异界敌人造成额外理智伤害
        const sanDmg = enemy.sanDamage ?? 0;
        if (sanDmg > 0) {
          characterStore.sanityDamage(sanDmg);
          player.value.san = Math.max(0, player.value.san - sanDmg);
        }

        addLogEntry({
          actor: enemy.name,
          action: '攻击',
          target: player.value.name,
          damage,
          roll: roll.value,
          result: roll.isCritical ? 'critical' : 'hit'
        });
      } else {
        addLogEntry({
          actor: enemy.name,
          action: '攻击',
          target: player.value.name,
          roll: roll.value,
          result: 'miss'
        });
      }
    });

    if (checkCombatEnd()) return;

    if (isActive.value && playerAlive.value) {
      turn.value++;

      // 技能冷却递减
      if (player.value?.skills) {
        player.value.skills.forEach(skill => {
          if (skill.currentCooldown > 0) skill.currentCooldown--;
        });
      }

      phase.value = 'PLAYER_TURN';
      addLogEntry({ actor: '系统', action: `回合 ${turn.value} — 你的回合` });
    }
  }

  // ===== 辅助 =====
  function pickTarget() {
    return enemies.value.find(e => e.hp > 0) || null;
  }

  function applyDamageToEnemy(enemy, damage) {
    const idx = enemies.value.indexOf(enemy);
    if (idx === -1) return;
    enemy.hp = Math.max(0, enemy.hp - damage);
  }

  function getAttackBonus() {
    let base = player.value?.attributes?.strength ?? 10;
    // 装备加成（铁管等）
    const inv = player.value?.inventory ?? [];
    inv.forEach(it => {
      if (it.type === 'weapon' && it.equip?.attackBonus) {
        base += it.equip.attackBonus;
      }
    });
    return base;
  }

  function checkCombatEnd() {
    if (!playerAlive.value) {
      endCombat(false);
      return true;
    }
    if (aliveEnemies.value.length === 0) {
      endCombat(true);
      return true;
    }
    return false;
  }

  function syncPlayerToCharacter() {
    const characterStore = useCharacterStore();
    if (!characterStore.character || !player.value) return;
    characterStore.character.hp = player.value.hp;
    characterStore.character.san = player.value.san;
    characterStore.character.activeEffects = player.value.activeEffects ?? [];
  }

  function addLogEntry(entry) {
    log.value.push({
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
  }

  function resetCombat() {
    isActive.value = false;
    turn.value = 1;
    phase.value = 'INITIATIVE';
    player.value = null;
    enemies.value = [];
    log.value = [];
    selectedAction.value = null;
    resultInfo.value = null;
    returnSceneId.value = null;
    nextSceneId.value = null;
  }

  return {
    isActive,
    turn,
    phase,
    player,
    enemies,
    log,
    selectedAction,
    resultInfo,
    returnSceneId,
    nextSceneId,
    isPlayerTurn,
    aliveEnemies,
    playerAlive,
    startCombat,
    endCombat,
    playerAttack,
    playerDefend,
    playerUseSkill,
    playerUseItem,
    enemyTurn,
    addLogEntry,
    resetCombat
  };
});

// 结构化克隆的兜底实现（部分环境无 structuredClone）
function structuredCloneSafe(obj) {
  // 脱敏 Vue reactive 代理对象，避免 DataCloneError
  const raw = toRaw(obj);
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(raw);
    } catch {
      return JSON.parse(JSON.stringify(raw));
    }
  }
  return JSON.parse(JSON.stringify(raw));
}
