import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { useRouter } from 'vue-router';

export function useGameFlow() {
  const gameStore = useGameStore();
  const router = useRouter();
  
  const gamePhase = computed(() => gameStore.gamePhase);
  const currentScene = computed(() => gameStore.currentScene);
  const scenarioTitle = computed(() => gameStore.currentScenario?.title || '');
  
  function loadScenario(scenarioId) {
    gameStore.loadScenario(scenarioId);
    router.push(`/game/${scenarioId}`);
  }
  
  function goToScene(sceneId) {
    gameStore.loadScene(sceneId);
  }
  
  function makeChoice(choice) {
    gameStore.makeChoice(choice);
  }
  
  function triggerSkillCheck(requirement) {
    gameStore.setGamePhase('SKILL_CHECK');
  }
  
  function triggerCombat(enemies) {
    gameStore.setGamePhase('COMBAT');
    router.push('/battle');
  }
  
  function goBack() {
    gameStore.goBack();
  }
  
  function endChapter() {
    gameStore.endChapter();
  }
  
  return {
    gamePhase,
    currentScene,
    scenarioTitle,
    loadScenario,
    goToScene,
    makeChoice,
    triggerSkillCheck,
    triggerCombat,
    goBack,
    endChapter
  };
}
