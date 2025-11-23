// AUDIO SYSTEM - Music Generator and Sound Manager

class AudioManager {
    constructor() {
        this.ctx = null;
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        
        // Music state
        this.isPlaying = false;
        this.nextNoteTime = 0;
        this.tick = 0; // 16th note counter
        this.tempo = 170; // Geometry Dash style: Fast, intense
        this.lookahead = 25.0; 
        this.scheduleAheadTime = 0.1;
        this.timerID = null;
        this.section = 'intro'; // Track song sections for build-ups/drops
        
        // --- GEOMETRY DASH INSPIRED SEQUENCE ---
        // Aggressive, high-energy electronic with build-ups and drops
        
        const s = 1; // 16th note
        const e = 2; // 8th note
        const q = 4; // Quarter note
        
        // Main aggressive riff - Dm pentatonic scale
        const mainRiff = [
            {n: 'D4', d: s}, {n: 'F4', d: s}, {n: 'A4', d: s}, {n: 'D5', d: s},
            {n: 'C5', d: e}, {n: 'A4', d: s}, {n: 'F4', d: s},
            {n: 'D4', d: s}, {n: 'F4', d: s}, {n: 'A4', d: e}, {n: 'C5', d: e}
        ]; // 16 ticks
        
        // Build-up arpeggio (climbing tension)
        const buildUp = [
            {n: 'D4', d: s}, {n: 'F4', d: s}, {n: 'A4', d: s}, {n: 'C5', d: s},
            {n: 'D5', d: s}, {n: 'F5', d: s}, {n: 'A5', d: s}, {n: 'D6', d: s},
            {n: 'A5', d: s}, {n: 'F5', d: s}, {n: 'D5', d: s}, {n: 'C5', d: s},
            {n: 'A4', d: s}, {n: 'F4', d: s}, {n: 'D4', d: s}, {n: 'D4', d: s}
        ]; // 16 ticks
        
        // Drop/Chorus - Heavy, sustained power notes
        const dropRiff = [
            {n: 'D3', d: q}, {n: 'D3', d: q}, {n: 'C3', d: q}, {n: 'A2', d: q},
            {n: 'F3', d: q}, {n: 'D3', d: q}, {n: 'A2', d: e}, {n: 'D3', d: e+q}
        ]; // 32 ticks (2 bars)
        
        // Intense lead line
        const leadLine = [
            {n: 'F5', d: e}, {n: 'E5', d: e}, {n: 'D5', d: e}, {n: 'C5', d: e},
            {n: 'D5', d: e}, {n: 'A4', d: e}, {n: 'F4', d: q},
            {n: 'A4', d: s}, {n: 'C5', d: s}, {n: 'D5', d: e}, {n: 'F5', d: q}
        ]; // 16 ticks
        
        // Construct full loop with build-ups and drops like Geometry Dash
        this.sequence = [
            // Intro - Main riff (16 bars)
            ...mainRiff, ...mainRiff, ...mainRiff, ...mainRiff,
            ...mainRiff, ...mainRiff, ...mainRiff, ...mainRiff,
            ...mainRiff, ...mainRiff, ...mainRiff, ...mainRiff,
            ...mainRiff, ...mainRiff, ...mainRiff, ...mainRiff,
            
            // Build-up (8 bars)
            ...buildUp, ...buildUp, ...buildUp, ...buildUp,
            ...buildUp, ...buildUp, ...buildUp, ...buildUp,
            
            // DROP! (16 bars)
            ...dropRiff, ...leadLine,
            ...dropRiff, ...leadLine,
            ...dropRiff, ...leadLine,
            ...dropRiff, ...leadLine,
            ...dropRiff, ...leadLine,
            ...dropRiff, ...leadLine,
            ...dropRiff, ...leadLine,
            ...dropRiff, ...leadLine,
            
            // Back to main (8 bars)
            ...mainRiff, ...mainRiff, ...mainRiff, ...mainRiff,
            ...mainRiff, ...mainRiff, ...mainRiff, ...mainRiff,
            
            // Final build and drop
            ...buildUp, ...buildUp, ...buildUp, ...buildUp,
            ...dropRiff, ...leadLine, ...dropRiff, ...leadLine
        ];
        
        this.frequencies = this.createNoteTable();
        
        // Filters for dynamic automation
        this.cutoffLFO = 0;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createNoteTable() {
        const notes = {};
        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < names.length; j++) {
                const n = i * 12 + j + 12;
                const freq = 440 * Math.pow(2, (n - 69) / 12);
                notes[names[j] + i] = freq;
            }
        }
        return notes;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('musicEnabled', this.musicEnabled);
        if (this.musicEnabled) this.startMusic();
        else this.stopMusic();
        return this.musicEnabled;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        return this.soundEnabled;
    }

    startMusic() {
        if (!this.musicEnabled || this.isPlaying) return;
        this.init(); 
        this.isPlaying = true;
        this.currentNoteIndex = 0;
        this.tick = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.scheduler();
    }

    stopMusic() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
    }

    scheduler() {
        if (!this.isPlaying) return;
        
        const secondsPerTick = (60.0 / this.tempo) / 4; // 16th note duration

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.processTick(this.tick, this.nextNoteTime);
            this.nextNoteTime += secondsPerTick;
            this.tick++;
        }
        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    processTick(tick, time) {
        // 1. DRUMS (The Backbone)
        // Four-on-the-floor Kick (0, 4, 8, 12)
        const beat16 = tick % 16;
        
        // Kick: Driving, punchy
        if (beat16 % 4 === 0) {
            this.triggerKick(time);
        }
        
        // Snare/Clap: On the 2 and 4 (ticks 4 and 12) - wait, kicks are on 0,4,8,12?
        // If Kick is 0,4,8,12, that's every beat.
        // Snare usually on 4 and 12 (beats 2 and 4).
        if (beat16 === 4 || beat16 === 12) {
            this.triggerSnare(time);
        }
        
        // Hi-Hats: Offbeats (2, 6, 10, 14) = Open Hat. Others = Closed.
        if (beat16 % 2 === 0) {
             // 16th note groove
             if (beat16 % 4 === 2) {
                 this.triggerHat(time, true); // Open (offbeat)
             } else {
                 this.triggerHat(time, false); // Closed
             }
        }

        // 2. MELODY & BASS SEQUENCER
        // We need to track where we are in the melody array.
        // Since melody notes have variable duration, we can't just use `tick`.
        // We need a pointer that advances only when the note duration expires.
        
        // Check if we should play the next note
        if (!this.noteEndTime || tick >= this.noteEndTime) {
            const noteData = this.sequence[this.currentNoteIndex % this.sequence.length];
            const durationTicks = noteData.d;
            
            // Play Note
            this.triggerLead(noteData.n, time, durationTicks);
            
            // Play Bass (Follows root of current phrase)
            // Simple logic: Map currentNoteIndex to phrase sections
            this.triggerBass(this.currentNoteIndex, time, durationTicks, beat16);

            // Advance
            this.currentNoteIndex++;
            this.noteEndTime = tick + durationTicks;
        }
    }

    triggerLead(noteName, time, durationTicks) {
        if (!noteName || !this.frequencies[noteName]) return;
        
        const duration = durationTicks * ((60.0 / this.tempo) / 4);
        
        // Geometry Dash style: Aggressive square wave lead with distortion
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const distortion = this.ctx.createWaveShaper();

        // Triple oscillator for thickness
        osc1.type = 'square';
        osc1.frequency.value = this.frequencies[noteName];

        osc2.type = 'square';
        osc2.detune.value = 12; // Slightly detuned for fatness
        osc2.frequency.value = this.frequencies[noteName];

        osc3.type = 'sawtooth';
        osc3.detune.value = -12;
        osc3.frequency.value = this.frequencies[noteName];

        // Aggressive filter sweep
        filter.type = 'lowpass';
        filter.Q.value = 8; // Resonance for that "wub" sound
        filter.frequency.setValueAtTime(3000, time);
        filter.frequency.exponentialRampToValueAtTime(800, time + duration * 0.3);
        filter.frequency.setValueAtTime(800, time + duration * 0.3);
        filter.frequency.exponentialRampToValueAtTime(400, time + duration);

        // Simple distortion
        distortion.curve = this.makeDistortionCurve(50);
        distortion.oversample = '2x';

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(filter);
        filter.connect(distortion);
        distortion.connect(this.ctx.destination);

        // Punchy envelope
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.linearRampToValueAtTime(0.18, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc1.start(time);
        osc2.start(time);
        osc3.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
        osc3.stop(time + duration);
    }

    makeDistortionCurve(amount) {
        const k = amount;
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    triggerBass(noteIndex, time, durationTicks, beat16) {
        // Geometry Dash style: MASSIVE wobble bass on certain sections
        
        // Only trigger on 8th notes
        if (beat16 % 2 !== 0) return;

        // Determine root based on progression
        let root = 'D2';
        const cycle = this.currentNoteIndex % 100;
        if (cycle >= 25 && cycle < 50) root = 'F2';
        if (cycle >= 50 && cycle < 75) root = 'C2';
        if (cycle >= 75) root = 'A1';

        if (this.frequencies[root]) {
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            // Dual saw for thick bass
            osc.type = 'sawtooth';
            osc.frequency.value = this.frequencies[root];
            
            osc2.type = 'sawtooth';
            osc2.detune.value = -7; // Detune for width
            osc2.frequency.value = this.frequencies[root];

            // Wobble effect - modulate filter frequency
            filter.type = 'lowpass';
            filter.Q.value = 15; // High resonance for that "wub wub"
            
            const wobbleSpeed = 8; // Hz
            const wobbleDepth = 400;
            const baseFreq = 200;
            
            // Create LFO wobble
            const wobbleTime = time % (1 / wobbleSpeed);
            const wobblePhase = wobbleTime * wobbleSpeed * Math.PI * 2;
            const wobbleValue = baseFreq + Math.sin(wobblePhase) * wobbleDepth;
            
            filter.frequency.setValueAtTime(wobbleValue, time);
            filter.frequency.exponentialRampToValueAtTime(
                baseFreq + Math.sin((wobblePhase + 0.2)) * wobbleDepth, 
                time + 0.1
            );

            const isKickHit = (beat16 % 4 === 0);
            const vol = isKickHit ? 0.15 : 0.35; // Sidechain pumping
            
            gain.gain.setValueAtTime(vol, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc2.start(time);
            osc.stop(time + 0.25);
            osc2.stop(time + 0.25);
        }
    }

    triggerKick(time) {
        // Geometry Dash style: Deep, punchy 808 kick
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sine';
        
        // Pitch sweep for punch
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.3);
        
        // Lowpass for thump
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(50, time + 0.3);
        
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.3);
    }

    triggerSnare(time) {
        // Geometry Dash style: Tight, snappy snare with more noise
        this.createNoiseBurst(time, 0.12, 2000, 0.35);
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.exponentialRampToValueAtTime(180, time + 0.05);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.12);
    }

    triggerHat(time, open) {
        // Crisper, more aggressive hi-hats
        const dur = open ? 0.15 : 0.04;
        const vol = open ? 0.15 : 0.08;
        this.createNoiseBurst(time, dur, 8000, vol);
    }

    createNoiseBurst(time, duration, freq, vol) {
        if (!this.noiseBuffer) {
             const bSize = this.ctx.sampleRate * 2;
             const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
             const d = b.getChannelData(0);
             for (let i=0; i<bSize; i++) d[i] = Math.random() * 2 - 1;
             this.noiseBuffer = b;
        }
        
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = freq;
        const gain = this.ctx.createGain();
        
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        src.start(time);
        src.stop(time + duration);
    }

    playSound(type, intensity = 1) {
        if (!this.soundEnabled) return;
        this.init(); 
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        switch(type) {
            case 'jump':
                osc.frequency.setValueAtTime(200 + (intensity * 50), now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'collision':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'gameOver':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'score':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
        }
    }
}

const audioManager = new AudioManager();
