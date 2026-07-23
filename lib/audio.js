// Client-side voice-compression pipeline. Mirrors the MATLAB VoiceCom.m logic:
//   64 kbps -> 8000 Hz x 8 bit,  32 kbps -> 8000 Hz x 4 bit,
//    8 kbps -> 4000 Hz x 2 bit,   2 kbps -> 2000 Hz x 1 bit.
// Everything is rendered back to 8 kHz so the WAVs play at the right speed.

// ---- decode an uploaded/recorded file to a normalised mono Float32Array ----
export async function decodeToMono(arrayBuffer) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const buf = await ctx.decodeAudioData(arrayBuffer.slice(0));
  const len = buf.length;
  const mono = new Float32Array(len);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) mono[i] += d[i];
  }
  for (let i = 0; i < len; i++) mono[i] /= buf.numberOfChannels;
  // normalise
  let peak = 0;
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(mono[i]));
  if (peak > 0) for (let i = 0; i < len; i++) mono[i] /= peak;
  const sr = buf.sampleRate;
  ctx.close();
  return { data: mono, sampleRate: sr };
}

// ---- windowed-sinc resampler (anti-aliased on downsampling) ----
export function resample(input, inRate, outRate) {
  if (inRate === outRate) return input.slice();
  const ratio = outRate / inRate;
  const outLen = Math.max(1, Math.round(input.length * ratio));
  const out = new Float32Array(outLen);
  const fc = Math.min(inRate, outRate) / 2 / inRate; // normalised cutoff (<= 0.5)
  const A = 16;                                        // half kernel width (input samples)
  for (let i = 0; i < outLen; i++) {
    const center = i / ratio;
    const j0 = Math.floor(center - A), j1 = Math.floor(center + A);
    let acc = 0, norm = 0;
    for (let j = j0; j <= j1; j++) {
      if (j < 0 || j >= input.length) continue;
      const x = center - j;
      const t = 2 * fc * x;
      const s = t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
      const w = Math.abs(x) <= A ? 0.5 + 0.5 * Math.cos((Math.PI * x) / A) : 0;
      const k = 2 * fc * s * w;
      acc += input[j] * k;
      norm += k;
    }
    out[i] = norm > 1e-9 ? acc / norm : acc;
  }
  return out;
}

// ---- uniform bit-depth reduction (quantize_audio.m) ----
export function quantize(x, bits) {
  const L = Math.pow(2, bits);
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    let v = Math.max(-1, Math.min(1, x[i]));
    const q = Math.round(((v + 1) / 2) * (L - 1));
    y[i] = (q / (L - 1)) * 2 - 1;
  }
  return y;
}

// ---- 16-bit PCM mono WAV encoder ----
export function encodeWav(samples, sampleRate) {
  const n = samples.length;
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); view.setUint32(4, 36 + n * 2, true); str(8, "WAVE");
  str(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  str(36, "data"); view.setUint32(40, n * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    o += 2;
  }
  return new Uint8Array(buffer);
}

// ---- full pipeline: returns the 4 compressed tracks, all at 8 kHz ----
export function compress(mono, srcRate) {
  const FS = 8000;
  let x64 = quantize(resample(mono, srcRate, 8000), 8);            // 8000 x 8
  let x32 = quantize(resample(mono, srcRate, 8000), 4);            // 8000 x 4
  let x8 = resample(quantize(resample(mono, srcRate, 4000), 2), 4000, 8000); // 4000 x 2 -> 8000
  let x2 = resample(quantize(resample(mono, srcRate, 2000), 1), 2000, 8000); // 2000 x 1 -> 8000
  const N = Math.min(x64.length, x32.length, x8.length, x2.length);
  const cut = (a) => a.slice(0, N);
  return { sampleRate: FS, N, x64: cut(x64), x32: cut(x32), x8: cut(x8), x2: cut(x2) };
}
