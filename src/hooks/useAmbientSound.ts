import { useEffect, useRef, useState } from 'react';

export type AmbientSound = 'none' | 'rain' | 'ocean' | 'whiteNoise';

export const AMBIENT_SOUND_LABELS: Record<AmbientSound, string> = {
  none: 'Silenzio',
  rain: 'Pioggia',
  ocean: 'Onde del mare',
  whiteNoise: 'Rumore bianco',
};

function createNoiseBuffer(ctx: AudioContext, kind: 'white' | 'brown') {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (kind === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
  }

  return buffer;
}

interface AudioGraph {
  ctx: AudioContext;
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
  gain: GainNode;
}

function buildGraph(ctx: AudioContext, sound: Exclude<AmbientSound, 'none'>): AudioGraph {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  if (sound === 'rain') {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, 'white');
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 900;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2200;
    bandpass.Q.value = 0.6;

    source.connect(filter);
    filter.connect(bandpass);
    bandpass.connect(gain);
    source.start();

    return { ctx, source, filter, gain };
  }

  if (sound === 'ocean') {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, 'brown');
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    source.connect(filter);
    filter.connect(gain);
    source.start();

    return { ctx, source, filter, lfo, lfoGain, gain };
  }

  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, 'white');
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 6000;
  source.connect(filter);
  filter.connect(gain);
  source.start();

  return { ctx, source, filter, gain };
}

export function useAmbientSound() {
  const [sound, setSound] = useState<AmbientSound>('none');
  const [volume, setVolume] = useState(0.35);
  const graphRef = useRef<AudioGraph | null>(null);

  const teardown = () => {
    const graph = graphRef.current;
    if (!graph) return;
    try {
      graph.source.stop();
      graph.lfo?.stop();
    } catch {
      /* already stopped */
    }
    graph.ctx.close();
    graphRef.current = null;
  };

  useEffect(() => {
    teardown();

    if (sound !== 'none') {
      const ctx = new AudioContext();
      const graph = buildGraph(ctx, sound);
      graph.gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.4);
      graphRef.current = graph;
    }

    return teardown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound]);

  useEffect(() => {
    const graph = graphRef.current;
    if (graph) {
      graph.gain.gain.setTargetAtTime(volume, graph.ctx.currentTime, 0.2);
    }
  }, [volume]);

  useEffect(() => teardown, []);

  return { sound, setSound, volume, setVolume };
}
