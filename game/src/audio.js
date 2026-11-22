// Synthesised sound: no audio files, only the Web Audio API. Footsteps,
// loot chimes, a rising alarm tone, the soft click of a sweeping camera and
// a low tension drone, all built from oscillators and filtered noise.

export function createAudio() {
  return {
    context: null,
    muted: false,
    droneNodes: null,
    ensure() {
      if (this.context) {
        if (this.context.state === 'suspended') this.context.resume().catch(() => {});
        return;
      }
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.context = new AudioContextClass();
      } catch {
        this.context = null;
      }
    },
    setMuted(muted) {
      this.muted = muted;
      if (this.droneNodes) {
        this.droneNodes.gain.gain.value = muted ? 0 : 0.035;
      }
    },
    tone(frequency, duration, type, volume, when) {
      if (!this.context || this.muted) return;
      try {
        const start = this.context.currentTime + (when ?? 0);
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.05);
      } catch {
        // Sound is garnish; a failed note never stops the heist.
      }
    },
    noiseBurst(duration, volume, frequency) {
      if (!this.context || this.muted) return;
      try {
        const length = Math.floor(this.context.sampleRate * duration);
        const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let index = 0; index < length; index += 1) {
          data[index] = (Math.random() * 2 - 1) * (1 - index / length);
        }
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency;
        const gain = this.context.createGain();
        gain.gain.value = volume;
        source.connect(filter).connect(gain).connect(this.context.destination);
        source.start();
      } catch {
        // See tone(): sound never blocks play.
      }
    },
    step(running, sneaking) {
      if (sneaking) return;
      this.noiseBurst(0.05, running ? 0.12 : 0.06, 500);
    },
    chime() {
      this.tone(880, 0.18, 'sine', 0.12);
      this.tone(1318, 0.24, 'sine', 0.08, 0.07);
    },
    relic() {
      this.tone(523, 0.2, 'triangle', 0.14);
      this.tone(659, 0.2, 'triangle', 0.14, 0.09);
      this.tone(784, 0.3, 'triangle', 0.14, 0.18);
      this.tone(1046, 0.4, 'sine', 0.1, 0.27);
    },
    alarmTick(level) {
      this.tone(220 + level * 3, 0.12, 'square', 0.05);
    },
    cameraClick() {
      this.tone(1800, 0.03, 'square', 0.03);
    },
    caught() {
      this.tone(196, 0.3, 'sawtooth', 0.12);
      this.tone(147, 0.45, 'sawtooth', 0.12, 0.15);
    },
    decoy() {
      this.tone(1567, 0.12, 'sine', 0.1);
      this.tone(2093, 0.2, 'sine', 0.08, 0.06);
    },
    smoke() {
      this.noiseBurst(0.4, 0.1, 900);
    },
    buy() {
      this.tone(660, 0.1, 'triangle', 0.1);
      this.tone(990, 0.16, 'triangle', 0.1, 0.08);
    },
    glide() {
      this.noiseBurst(0.5, 0.07, 2400);
    },
    jammer() {
      this.tone(120, 0.25, 'square', 0.08);
      this.tone(90, 0.3, 'square', 0.06, 0.12);
    },
    win() {
      const notes = [523, 659, 784, 1046, 1318];
      notes.forEach((note, index) => this.tone(note, 0.35, 'triangle', 0.12, index * 0.12));
    },
    startDrone() {
      if (!this.context || this.droneNodes || this.muted) return;
      try {
        const oscillator = this.context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 55;
        const second = this.context.createOscillator();
        second.type = 'sine';
        second.frequency.value = 55 * 1.5;
        const gain = this.context.createGain();
        gain.gain.value = 0.035;
        const lfo = this.context.createOscillator();
        lfo.frequency.value = 0.07;
        const lfoGain = this.context.createGain();
        lfoGain.gain.value = 0.015;
        lfo.connect(lfoGain).connect(gain.gain);
        oscillator.connect(gain);
        second.connect(gain);
        gain.connect(this.context.destination);
        oscillator.start();
        second.start();
        lfo.start();
        this.droneNodes = { gain, oscillators: [oscillator, second, lfo] };
      } catch {
        this.droneNodes = null;
      }
    },
  };
}
