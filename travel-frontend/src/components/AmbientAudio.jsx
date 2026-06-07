import { useEffect, useRef, useCallback } from 'react';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function createWindNode(ctx) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 400;
  lp.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  source.connect(lp);
  lp.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  return { source, gain, lp };
}

function createChimesNode(ctx) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  const frequencies = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  let intervalId = null;

  function playChime() {
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    env.gain.value = 0;

    osc.connect(env);
    env.connect(gain);

    const now = ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.15, now + 0.05);
    env.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.start(now);
    osc.stop(now + 2.5);
  }

  function startChimes() {
    playChime();
    intervalId = setInterval(() => {
      if (Math.random() < 0.4) playChime();
    }, 3000 + Math.random() * 4000);
  }

  function stopChimes() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  return { gain, startChimes, stopChimes };
}

export default function AmbientAudio({ playing, volume = 0.5 }) {
  const windRef = useRef(null);
  const chimesRef = useRef(null);
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    windRef.current = createWindNode(ctx);
    chimesRef.current = createChimesNode(ctx);

    windRef.current.gain.gain.setTargetAtTime(volume * 0.8, ctx.currentTime, 0.5);
    chimesRef.current.gain.gain.setTargetAtTime(volume * 0.3, ctx.currentTime, 0.5);
    chimesRef.current.startChimes();
  }, [volume]);

  const stop = useCallback(() => {
    if (!startedRef.current) return;

    const ctx = getAudioContext();
    if (windRef.current) {
      windRef.current.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      setTimeout(() => {
        try { windRef.current.source.stop(); } catch {}
        windRef.current = null;
      }, 1000);
    }
    if (chimesRef.current) {
      chimesRef.current.stopChimes();
      chimesRef.current.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      chimesRef.current = null;
    }
    startedRef.current = false;
  }, []);

  useEffect(() => {
    if (playing) start();
    else stop();
    return () => stop();
  }, [playing, start, stop]);

  useEffect(() => {
    if (!startedRef.current) return;
    const ctx = getAudioContext();
    if (windRef.current) windRef.current.gain.gain.setTargetAtTime(volume * 0.8, ctx.currentTime, 0.3);
    if (chimesRef.current) chimesRef.current.gain.gain.setTargetAtTime(volume * 0.3, ctx.currentTime, 0.3);
  }, [volume]);

  return null;
}
