import { SoundEffectType, ProjectBgm } from '../types/motion';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private masterGain: GainNode | null = null;
  private bgmOscs: OscillatorNode[] = [];
  private bgmGains: GainNode[] = [];
  private isBgmPlaying = false;
  private currentBgmType: string = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioStream(): MediaStream | null {
    this.initContext();
    if (!this.ctx) return null;
    if (!this.destinationNode) {
      this.destinationNode = this.ctx.createMediaStreamDestination();
      if (this.masterGain) {
        this.masterGain.connect(this.destinationNode);
      }
    }
    return this.destinationNode.stream;
  }

  public playSFX(sfx: SoundEffectType, volume = 0.6) {
    if (sfx === 'none') return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const sfxGain = this.ctx.createGain();
      sfxGain.gain.setValueAtTime(volume, now);
      sfxGain.connect(this.masterGain);

      switch (sfx) {
        case 'whoosh': {
          // Filtered noise swoosh with exponential pitch bend
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, now);
          filter.frequency.exponentialRampToValueAtTime(2600, now + 0.15);
          filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

          sfxGain.gain.setValueAtTime(0.001, now);
          sfxGain.gain.exponentialRampToValueAtTime(volume, now + 0.12);
          sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(filter);
          filter.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.36);
          break;
        }

        case 'pop': {
          // Cheerful bubbly pop sound
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

          sfxGain.gain.setValueAtTime(volume, now);
          sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'hit': {
          // Punchy cinematic hit with low boom
          const subOsc = this.ctx.createOscillator();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(160, now);
          subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

          const snapOsc = this.ctx.createOscillator();
          snapOsc.type = 'triangle';
          snapOsc.frequency.setValueAtTime(480, now);
          snapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

          sfxGain.gain.setValueAtTime(volume * 1.2, now);
          sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          subOsc.connect(sfxGain);
          snapOsc.connect(sfxGain);
          subOsc.start(now);
          snapOsc.start(now);
          subOsc.stop(now + 0.45);
          snapOsc.stop(now + 0.2);
          break;
        }

        case 'chime': {
          // Sparkling harmonic chime (chord 523Hz, 659Hz, 783Hz)
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.03);

            noteGain.gain.setValueAtTime(volume * 0.35, now + idx * 0.03);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6 + idx * 0.05);

            osc.connect(noteGain);
            noteGain.connect(sfxGain);
            osc.start(now + idx * 0.03);
            osc.stop(now + 0.65 + idx * 0.05);
          });
          break;
        }

        case 'glitch': {
          // Cyberpunk digital glitch burst
          const osc = this.ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.setValueAtTime(880, now + 0.03);
          osc.frequency.setValueAtTime(240, now + 0.06);
          osc.frequency.setValueAtTime(1400, now + 0.09);
          osc.frequency.setValueAtTime(60, now + 0.12);

          sfxGain.gain.setValueAtTime(volume * 0.5, now);
          sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.19);
          break;
        }
      }
    } catch {
      // AudioContext policy or mute graceful fallback
    }
  }

  public updateBGM(bgm: ProjectBgm) {
    if (!bgm.enabled || bgm.type === 'none') {
      this.stopBGM();
      return;
    }
    if (this.isBgmPlaying && this.currentBgmType === bgm.type) {
      // Update volume
      this.bgmGains.forEach((g) => {
        if (this.ctx) g.gain.setTargetAtTime(bgm.volume * 0.15, this.ctx.currentTime, 0.1);
      });
      return;
    }
    this.startBGM(bgm);
  }

  public startBGM(bgm: ProjectBgm) {
    try {
      this.stopBGM();
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      this.isBgmPlaying = true;
      this.currentBgmType = bgm.type;
      const now = this.ctx.currentTime;

      if (bgm.type === 'cyber-pulse') {
        // Bass groove + rhythmic pulse
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(55, now); // A1

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);

        bassGain.gain.setValueAtTime(bgm.volume * 0.12, now);
        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.masterGain);

        bassOsc.start(now);
        this.bgmOscs.push(bassOsc);
        this.bgmGains.push(bassGain);
      } else if (bgm.type === 'ambient-chill') {
        // Warm dual pad chords
        [220, 277.18, 329.63].forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(bgm.volume * 0.08, now);
          osc.connect(g);
          g.connect(this.masterGain!);
          osc.start(now);
          this.bgmOscs.push(osc);
          this.bgmGains.push(g);
        });
      } else if (bgm.type === 'upbeat-groove') {
        // Bright sync pad
        [349.23, 440, 523.25].forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(bgm.volume * 0.07, now);
          osc.connect(g);
          g.connect(this.masterGain!);
          osc.start(now);
          this.bgmOscs.push(osc);
          this.bgmGains.push(g);
        });
      }
    } catch {
      // Audio policy safe
    }
  }

  public stopBGM() {
    this.bgmOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // safe
      }
    });
    this.bgmGains.forEach((g) => {
      try {
        g.disconnect();
      } catch {
        // safe
      }
    });
    this.bgmOscs = [];
    this.bgmGains = [];
    this.isBgmPlaying = false;
    this.currentBgmType = 'none';
  }
}

export const soundEngine = new SoundEngine();
