<template>
  <div class="min-h-screen bg-bg-dark p-8">
    <div class="max-w-2xl mx-auto">
      <!-- 标题 -->
      <h1 class="font-gothic text-4xl text-accent text-center mb-8">
        创建角色
      </h1>
      
      <!-- 角色名称 -->
      <div class="mb-6">
        <label class="block font-ui text-text-secondary mb-2">角色名称</label>
        <input
          v-model="characterName"
          type="text"
          placeholder="输入角色名称..."
          class="w-full px-4 py-3 bg-bg-panel border border-color-border rounded-lg text-text-primary font-body focus:outline-none focus:border-accent"
        />
      </div>
      
      <!-- 选择职业 -->
      <div class="mb-6">
        <label class="block font-ui text-text-secondary mb-2">选择职业</label>
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="cls in classes"
            :key="cls.id"
            :class="[
              'p-4 border rounded-lg transition-all duration-300 text-left',
              selectedClass === cls.id
                ? 'border-accent bg-bg-hover'
                : 'border-color-border bg-bg-panel hover:border-accent/50'
            ]"
            @click="handleClassSelect(cls.id)"
          >
            <h3 class="font-gothic text-text-primary mb-1">{{ cls.name }}</h3>
            <p class="text-sm text-text-secondary mb-2">{{ cls.description }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="h in cls.highlights"
                :key="h"
                class="px-2 py-0.5 bg-color-success/20 text-color-success text-xs rounded"
              >
                {{ h }}
              </span>
              <span
                v-for="w in cls.weaknesses"
                :key="w"
                class="px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded"
              >
                {{ w }}
              </span>
            </div>
          </button>
        </div>
      </div>
      
      <!-- 属性分配 -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <label class="font-ui text-text-secondary">属性分配</label>
          <span class="text-accent font-ui">剩余点数: {{ availablePoints }}</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="(attr, key) in attributes"
            :key="key"
            class="bg-bg-panel border border-color-border rounded-lg p-4 text-center"
          >
            <div class="text-text-secondary text-sm mb-1 uppercase">{{ getAttrName(key) }}</div>
            <div class="text-3xl font-gothic text-accent mb-2">{{ attr }}</div>
            <div class="flex justify-center gap-2">
              <button
                @click="decreaseAttr(key)"
                :disabled="attr <= (baseAttributes[key] || 8)"
                class="w-8 h-8 bg-bg-dark rounded text-text-primary hover:bg-bg-hover disabled:opacity-50"
              >
                -
              </button>
              <button
                @click="increaseAttr(key)"
                :disabled="availablePoints <= 0 || attr >= 20"
                class="w-8 h-8 bg-bg-dark rounded text-text-primary hover:bg-bg-hover disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 角色背景 -->
      <div class="mb-8">
        <label class="block font-ui text-text-secondary mb-2">角色背景</label>
        <select
          v-model="characterBackground"
          class="w-full px-4 py-3 bg-bg-panel border border-color-border rounded-lg text-text-primary font-body focus:outline-none focus:border-accent"
        >
          <option value="" disabled>选择角色背景...</option>
          <option value="detective">私家侦探 - 曾是警探，因调查超自然事件被开除</option>
          <option value="occultist">神秘学者 - 研究黑暗魔法与禁忌知识</option>
          <option value="survivor">幸存者 - 曾遭遇超自然事件并活了下来</option>
          <option value="reporter">调查记者 - 专门揭露都市传说背后的真相</option>
          <option value="doctor">法医 - 在停尸房见过太多不可思议的事情</option>
          <option value="exorcist">驱魔师 - 来自教会的神圣战士</option>
        </select>
      </div>
      
      <!-- 验证错误提示 -->
      <div v-if="validationErrors.length > 0" class="mb-4 p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
        <div class="text-secondary font-bold mb-2">请完成以下项：</div>
        <ul class="list-disc list-inside space-y-1 text-text-secondary text-sm">
          <li v-for="(error, index) in validationErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>
      
      <!-- 创建按钮 -->
      <div class="flex gap-4">
        <Button variant="secondary" size="lg" @click="handleBack" class="flex-1">
          返回
        </Button>
        <Button
          variant="primary"
          size="lg"
          @click="handleCreate"
          :disabled="!canCreate"
          class="flex-1"
        >
          创建角色
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { useCharacterStore } from '../stores/characterStore';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const gameStore = useGameStore();
const characterStore = useCharacterStore();

const characterName = ref('');
const characterBackground = ref('');
const selectedClass = ref('investigator');
const availablePoints = ref(0);
const baseAttributes = ref({});

const attributes = ref({
  strength: 10,
  agility: 10,
  intelligence: 10,
  perception: 10,
  charisma: 10,
  willpower: 10
});

const totalPoints = 70;
const initialTotal = 60;
const maxAttr = 20;

const classes = [
  { 
    id: 'investigator', 
    name: '调查员', 
    description: '善于发现线索和分析情报',
    initialAttributes: { strength: 8, agility: 10, intelligence: 14, perception: 13, charisma: 8, willpower: 7 },
    highlights: ['智力', '感知'],
    weaknesses: ['力量']
  },
  { 
    id: 'medium', 
    name: '灵媒师', 
    description: '能与灵界沟通的神秘主义者',
    initialAttributes: { strength: 8, agility: 6, intelligence: 9, perception: 12, charisma: 11, willpower: 14 },
    highlights: ['意志', '魅力'],
    weaknesses: ['敏捷']
  },
  { 
    id: 'mage', 
    name: '法师', 
    description: '掌握暗黑魔法的术士',
    initialAttributes: { strength: 6, agility: 10, intelligence: 15, perception: 10, charisma: 8, willpower: 11 },
    highlights: ['智力', '意志'],
    weaknesses: ['力量']
  },
  { 
    id: 'hunter', 
    name: '猎人', 
    description: '专门猎杀超自然生物的战士',
    initialAttributes: { strength: 13, agility: 13, intelligence: 7, perception: 11, charisma: 8, willpower: 8 },
    highlights: ['力量', '敏捷'],
    weaknesses: ['智力']
  }
];

const canCreate = computed(() => {
  return characterName.value.trim().length > 0 && availablePoints.value === 0 && characterBackground.value.trim().length > 0;
});

const validationErrors = computed(() => {
  const errors = [];
  if (!characterName.value.trim()) {
    errors.push('角色名称未输入');
  }
  if (availablePoints.value > 0) {
    errors.push(`还有 ${availablePoints.value} 点属性未分配`);
  }
  if (!characterBackground.value.trim()) {
    errors.push('角色背景未选择');
  }
  return errors;
});

function increaseAttr(key) {
  if (availablePoints.value > 0 && attributes.value[key] < maxAttr) {
    attributes.value[key]++;
    availablePoints.value--;
  }
}

function decreaseAttr(key) {
  const minValue = baseAttributes.value[key] || 8;
  if (attributes.value[key] > minValue) {
    attributes.value[key]--;
    availablePoints.value++;
  }
}

function getAttrName(attr) {
  const names = {
    strength: '力量',
    agility: '敏捷',
    intelligence: '智力',
    perception: '感知',
    charisma: '魅力',
    willpower: '意志'
  };
  return names[attr] || attr;
}

function loadClassAttributes(classId) {
  const charClass = classes.find(c => c.id === classId);
  if (charClass) {
    baseAttributes.value = { ...charClass.initialAttributes };
    attributes.value = { ...charClass.initialAttributes };
    const usedPoints = Object.values(attributes.value).reduce((sum, val) => sum + val, 0);
    availablePoints.value = totalPoints - usedPoints;
  }
}

function handleClassSelect(classId) {
  selectedClass.value = classId;
  loadClassAttributes(classId);
}

function handleBack() {
  router.push('/');
}

function handleCreate() {
  characterStore.createCharacter({
    name: characterName.value,
    class: selectedClass.value,
    attributes: { ...attributes.value },
    background: characterBackground.value,
    skills: []
  });
  gameStore.setGamePhase('SCENARIO_SELECT');
  router.push('/select');
}

loadClassAttributes('investigator');
</script>
