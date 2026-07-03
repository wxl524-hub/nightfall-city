export const scenarios = {
  'the-abandoned-hospital': {
    id: 'the-abandoned-hospital',
    title: '废弃医院',
    description: '深夜，你收到一封匿名信，指引你前往城市边缘的废弃医院。据说那里每晚都会传出诡异的声音...',
    difficulty: 'normal',
    chapters: [
      {
        id: 'chapter-1',
        title: '第一章：深夜来信',
        scenes: [
          {
            id: 'scene-1',
            title: '医院入口',
            text: '你站在废弃医院的大门前。锈迹斑斑的铁门上挂着"禁止入内"的警示牌。月光透过破碎的窗户，在地面投下诡异的阴影。你注意到门口有一些新鲜的脚印。',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '直接推门进入',
                nextSceneId: 'scene-2',
                requirement: null
              },
              {
                id: 'option-2',
                text: '检查门口的脚印',
                nextSceneId: 'scene-1a',
                requirement: {
                  type: 'skill_check',
                  attribute: 'perception',
                  dc: 12,
                  checkType: 'investigation'
                }
              },
              {
                id: 'option-3',
                text: '【侦探专属】仔细观察周围环境',
                nextSceneId: 'scene-1b',
                requirement: null,
                requiredBackground: 'detective'
              }
            ]
          },
          {
            id: 'scene-1a',
            title: '脚印分析',
            text: '你蹲下身仔细检查脚印。这些脚印看起来是最近留下的，鞋印很小，似乎是女性的鞋子。更奇怪的是，脚印只有进去的，没有出来的...',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '继续进入医院',
                nextSceneId: 'scene-2',
                requirement: null
              },
              {
                id: 'option-2',
                text: '【法医专属】检查脚印的细节',
                nextSceneId: 'scene-1c',
                requirement: null,
                requiredBackground: 'doctor'
              }
            ]
          },
          {
            id: 'scene-1b',
            title: '侦探的直觉',
            text: '作为一名经验丰富的侦探，你注意到了几个关键点：铁门虽然生锈，但锁已经被撬开；窗户上的玻璃碎片是从内部向外破碎的；墙角有新鲜的烟头。有人最近来过这里，而且很可能还在里面。',
            type: 'narrative',
            bonusInfo: '你获得了额外线索：入侵者是右撇子，大约170cm高。',
            options: [
              {
                id: 'option-1',
                text: '进入医院',
                nextSceneId: 'scene-2',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-1c',
            title: '法医的发现',
            text: '你仔细检查脚印，发现鞋底有特殊的花纹，这是一种专业的医疗鞋。更重要的是，你注意到脚印中有一些暗红色的斑点...那是干涸的血迹。',
            type: 'narrative',
            bonusInfo: '你获得了额外线索：血迹属于AB型血，大约是三天前留下的。',
            options: [
              {
                id: 'option-1',
                text: '进入医院调查',
                nextSceneId: 'scene-2',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-2',
            title: '大厅',
            text: '你进入了医院的大厅。空气中弥漫着灰尘和消毒剂混合的奇怪气味。前台的桌子已经腐烂，地上散落着破旧的病历。远处传来一阵低沉的呻吟声。',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '向声音来源走去',
                nextSceneId: 'scene-3',
                requirement: null
              },
              {
                id: 'option-2',
                text: '检查前台的病历',
                nextSceneId: 'scene-2a',
                requirement: {
                  type: 'skill_check',
                  attribute: 'intelligence',
                  dc: 10,
                  checkType: 'investigation'
                }
              },
              {
                id: 'option-3',
                text: '【神秘学者专属】尝试感知周围的能量',
                nextSceneId: 'scene-2b',
                requirement: null,
                requiredBackground: 'occultist'
              }
            ]
          },
          {
            id: 'scene-2a',
            title: '病历档案',
            text: '你在前台找到了一份保存相对完好的病历。这是一位名叫李雨桐的女患者的记录，她在十年前因为"精神异常"被送入这家医院。病历最后一页写着："患者声称能看到死者的灵魂，建议进行隔离观察..."',
            type: 'narrative',
            bonusInfo: '你发现了关键线索：李雨桐可能是这起事件的关键人物。',
            options: [
              {
                id: 'option-1',
                text: '继续深入医院',
                nextSceneId: 'scene-3',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-2b',
            title: '神秘感知',
            text: '你闭上眼睛，尝试感知周围的灵体能量。一股强烈的阴冷感从地下室方向传来，夹杂着绝望和愤怒的情绪。你还感觉到二楼有一个微弱但纯净的能量源，似乎是某种保护结界。',
            type: 'narrative',
            bonusInfo: '你获得了额外线索：地下室有危险，二楼可能有避难所。',
            options: [
              {
                id: 'option-1',
                text: '前往地下室',
                nextSceneId: 'scene-3',
                requirement: null
              },
              {
                id: 'option-2',
                text: '先去二楼查看',
                nextSceneId: 'scene-4',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-3',
            title: '地下室入口',
            text: '你顺着声音来到了地下室入口。铁门半开着，里面一片漆黑。呻吟声越来越清晰，听起来像是一个女人的声音。',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '进入地下室',
                nextSceneId: 'scene-3a',
                requirement: null
              },
              {
                id: 'option-2',
                text: '【驱魔师专属】准备神圣物品',
                nextSceneId: 'scene-3b',
                requirement: null,
                requiredBackground: 'exorcist'
              },
              {
                id: 'option-3',
                text: '【幸存者专属】谨慎后退观察',
                nextSceneId: 'scene-3c',
                requirement: null,
                requiredBackground: 'survivor'
              }
            ]
          },
          {
            id: 'scene-3a',
            title: '地下室',
            text: '你进入地下室，一股腐臭味扑面而来。角落里，一个女人的身影蜷缩在地上，她的身体不断颤抖。当她抬起头时，你看到她的眼睛是空洞的白色...',
            type: 'narrative',
            triggerEvent: {
              type: 'combat',
              enemy: 'possessed-woman',
              nextSceneId: 'scene-4'
            }
          },
          {
            id: 'scene-3b',
            title: '神圣准备',
            text: '你从背包中取出圣水和十字架，开始祈祷。神圣的光芒从你身上散发出来，驱散了周围的黑暗。你感到一股力量注入体内，准备迎接即将到来的战斗。',
            type: 'narrative',
            bonus: {
              type: 'temporary_buff',
              attribute: 'willpower',
              value: 3,
              duration: 'combat'
            },
            options: [
              {
                id: 'option-1',
                text: '进入地下室',
                nextSceneId: 'scene-3a',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-3c',
            title: '幸存者的直觉',
            text: '你的求生本能告诉你，直接进去太危险了。你注意到入口旁边有一根生锈的铁管，也许可以用来防身。你还发现地上有一些奇怪的符号，像是某种仪式留下的痕迹。',
            type: 'narrative',
            bonusInfo: '你获得了武器：铁管（+2攻击力）',
            options: [
              {
                id: 'option-1',
                text: '进入地下室',
                nextSceneId: 'scene-3a',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-4',
            title: '二楼走廊',
            text: '你来到二楼，这里相对完好一些。墙上挂着一些褪色的照片，记录着医院曾经的样子。尽头的房间门口散发着微弱的光芒。',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '进入发光的房间',
                nextSceneId: 'scene-4a',
                requirement: null
              },
              {
                id: 'option-2',
                text: '【记者专属】查看墙上的照片',
                nextSceneId: 'scene-4b',
                requirement: null,
                requiredBackground: 'reporter'
              }
            ]
          },
          {
            id: 'scene-4a',
            title: '神秘的房间',
            text: '你推开门，看到一位白发苍苍的老人坐在椅子上。她看起来很虚弱，但眼睛依然有神。"你终于来了，"她说，"我等这一刻已经很久了..."',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '询问她是谁',
                nextSceneId: 'scene-4c',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-4b',
            title: '照片中的秘密',
            text: '你仔细查看墙上的照片，发现了一张特殊的照片：照片中有四个人站在医院门口，其中一个人你认识...是十年前失踪的著名医生张明远。更重要的是，你在照片的角落发现了一个熟悉的符号——和你收到的匿名信上的符号一样！',
            type: 'narrative',
            bonusInfo: '你发现了关键线索：匿名信可能来自张明远医生。',
            options: [
              {
                id: 'option-1',
                text: '进入发光的房间',
                nextSceneId: 'scene-4a',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-4c',
            title: '真相',
            text: '"我是这家医院的最后一位护士长，"老人说，"十年前，这里发生了一场悲剧。张明远医生试图用黑暗仪式复活他死去的女儿，但仪式失控，释放出了邪恶的力量。李雨桐是唯一的幸存者，但她的灵魂被邪恶力量污染了。你必须阻止这一切..."',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '前往地下室拯救李雨桐',
                nextSceneId: 'scene-3a',
                requirement: null
              },
              {
                id: 'option-2',
                text: '询问更多细节',
                nextSceneId: 'scene-4d',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-4d',
            title: '更多真相',
            text: '护士长告诉你，要净化李雨桐的灵魂，需要找到张明远留下的净化仪式手稿。手稿藏在医院的档案室里。但要小心，地下室的邪恶力量正在不断增强...',
            type: 'narrative',
            bonusInfo: '你获得了任务：找到净化仪式手稿',
            options: [
              {
                id: 'option-1',
                text: '前往档案室',
                nextSceneId: 'scene-5',
                requirement: null
              },
              {
                id: 'option-2',
                text: '直接前往地下室',
                nextSceneId: 'scene-3a',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-5',
            title: '档案室',
            text: '档案室里堆满了灰尘和蜘蛛网。你需要找到张明远医生的手稿。',
            type: 'narrative',
            options: [
              {
                id: 'option-1',
                text: '仔细搜索档案',
                nextSceneId: 'scene-5a',
                requirement: {
                  type: 'skill_check',
                  attribute: 'intelligence',
                  dc: 15,
                  checkType: 'investigation'
                }
              },
              {
                id: 'option-2',
                text: '【侦探专属】快速定位',
                nextSceneId: 'scene-5b',
                requirement: null,
                requiredBackground: 'detective'
              }
            ]
          },
          {
            id: 'scene-5a',
            title: '找到了！',
            text: '经过一番搜索，你找到了张明远医生的手稿。上面详细记录了净化仪式的步骤...',
            type: 'narrative',
            bonus: {
              type: 'item',
              itemId: 'purification-ritual'
            },
            options: [
              {
                id: 'option-1',
                text: '前往地下室进行净化仪式',
                nextSceneId: 'scene-3a',
                requirement: null
              }
            ]
          },
          {
            id: 'scene-5b',
            title: '侦探的效率',
            text: '凭借你的专业知识，你很快就找到了张明远医生的档案柜。里面不仅有净化仪式的手稿，还有一份额外的笔记，记录了仪式失败的原因和改进方法。',
            type: 'narrative',
            bonus: {
              type: 'item',
              itemId: 'purification-ritual-improved'
            },
            bonusInfo: '你获得了改进版净化仪式，成功率+20%',
            options: [
              {
                id: 'option-1',
                text: '前往地下室进行净化仪式',
                nextSceneId: 'scene-3a',
                requirement: null
              }
            ]
          }
        ]
      }
    ]
  }
};

export function getScenario(scenarioId) {
  return scenarios[scenarioId];
}

export function getScene(scenarioId, sceneId) {
  const scenario = scenarios[scenarioId];
  if (!scenario) return null;
  
  for (const chapter of scenario.chapters) {
    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (scene) return scene;
  }
  
  return null;
}

export function getAvailableOptions(scene, characterBackground) {
  if (!scene || !scene.options) return [];
  
  return scene.options.filter(option => {
    if (option.requiredBackground && option.requiredBackground !== characterBackground) {
      return false;
    }
    return true;
  });
}
