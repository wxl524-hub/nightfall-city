// AudioManager — 使用 Web Audio API 程序化生成音效
// 无需任何音频文件，全部由振荡器合成
class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.5; // 0~1
    this._reducedMotion = false;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      this.enabled = false;
    }
  }

  setEnabled(val) {
    this.enabled = val;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  // 内部：创建一个短暂的音调
  _playTone(frequency, duration, type = 'sine', gainMult = 1, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    if (this._reducedMotion) return; // 尊重 prefers-reduced-motion
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    gain.gain.setValueAtTime(this.volume * gainMult, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  // 内部：噪声爆发（用于打击）
  _playNoise(duration, gainMult = 0.3) {
    if (!this.enabled || !this.ctx) return;
    if (this._reducedMotion) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * gainMult, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  // ===== 公开音效接口 =====

  // UI 点击
  playClick() {
    this._playTone(800, 0.08, 'square', 0.15);
  }

  // 掷骰子
  playDiceRoll() {
    this._playNoise(0.15, 0.25);
    setTimeout(() => this._playTone(1200, 0.1, 'sine', 0.3), 100);
  }

  // 命中
  playHit() {
    this._playNoise(0.12, 0.4);
    this._playTone(200, 0.15, 'sawtooth', 0.3);
  }

  // 暴击
  playCritical() {
    this._playTone(523, 0.1, 'square', 0.4);
    setTimeout(() => this._playTone(659, 0.1, 'square', 0.4), 80);
    setTimeout(() => this._playTone(784, 0.15, 'square', 0.5), 160);
  }

  // 未命中
  playMiss() {
    this._playTone(200, 0.15, 'sine', 0.2);
  }

  // 治疗
  playHeal() {
    this._playTone(523, 0.2, 'sine', 0.3);
    setTimeout(() => this._playTone(659, 0.2, 'sine', 0.3), 150);
    setTimeout(() => this._playTone(784, 0.3, 'sine', 0.3), 300);
  }

  // 受伤
  playDamage() {
    this._playTone(150, 0.2, 'sawtooth', 0.35);
  }

  // 胜利
  playVictory() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      this._playTone(freq, 0.3, 'sine', 0.4, i * 180);
    });
  }

  // 失败
  playDefeat() {
    this._playTone(400, 0.3, 'sawtooth', 0.3);
    setTimeout(() => this._playTone(300, 0.3, 'sawtooth', 0.3), 250);
    setTimeout(() => this._playTone(200, 0.5, 'sawtooth', 0.3), 500);
  }

  // 检定成功
  playCheckSuccess() {
    this._playTone(660, 0.15, 'sine', 0.35);
    setTimeout(() => this._playTone(880, 0.2, 'sine', 0.35), 120);
  }

  // 检定失败
  playCheckFail() {
    this._playTone(300, 0.2, 'triangle', 0.3);
    setTimeout(() => this._playTone(200, 0.3, 'triangle', 0.25), 180);
  }

  // 场景切换（渐入）
  playSceneTransition() {
    this._playTone(440, 0.4, 'sine', 0.15);
    this._playTone(550, 0.4, 'sine', 0.1, 100);
  }

  // 升级
  playLevelUp() {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      this._playTone(freq, 0.25, 'triangle', 0.35, i * 120);
    });
  }
}

export const audioManager = new AudioManager();
