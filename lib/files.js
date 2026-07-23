// MATLAB source templates that go inside the downloaded zip.

export function voiceComM(prefix, filename) {
  const p = prefix ? `'${prefix}_'` : `''`;
  return `clc; clear; close all;

% =========================================================================
% VOICE COMPRESSION  -  Bit-depth reduction (digital down-sampling)
%
% A 64 kbps reference voice signal is compressed to 32, 8 and 2 kbps by
% jointly reducing the sampling rate and the amplitude bit depth, since
%       bit rate  =  sampling frequency (samples/s)  x  bits per sample.
% =========================================================================

prefix = ${p};                 % optional filename prefix (e.g. your matric)

%% Load voice/audio file
[x, Fs] = audioread('${filename}');
if size(x,2) > 1, x = mean(x,2); end     % stereo -> mono
x = x / max(abs(x));                     % normalise

%% Simulated bit-rate cases  (bit rate = sampling frequency x bits/sample)
Fs_64 = 8000;  x64   = quantize_audio(resample(x, Fs_64, Fs), 8);   % 8000 x 8 = 64 kbps
Fs_32 = 8000;  x32   = quantize_audio(resample(x, Fs_32, Fs), 4);   % 8000 x 4 = 32 kbps
Fs_8  = 4000;  x8    = quantize_audio(resample(x, Fs_8,  Fs), 2);   % 4000 x 2 =  8 kbps
Fs_2  = 2000;  x2    = quantize_audio(resample(x, Fs_2,  Fs), 1);   % 2000 x 1 =  2 kbps

%% Bring all back to 8 kHz for comparison / playback
x64_q  = x64;
x32_up = resample(x32, Fs_64, Fs_32);
x8_up  = resample(x8,  Fs_64, Fs_8);
x2_up  = resample(x2,  Fs_64, Fs_2);

N = min([length(x64_q), length(x32_up), length(x8_up), length(x2_up)]);
x64_q=x64_q(1:N); x32_up=x32_up(1:N); x8_up=x8_up(1:N); x2_up=x2_up(1:N);
t = (0:N-1)/Fs_64;

%% Waveform comparison
figure('Name','Waveforms','Position',[100 100 700 700]);
subplot(4,1,1); plot(t,x64_q);  title('64 kbps Voice Signal (reference)'); xlabel('Time (s)'); ylabel('Amplitude'); grid on;
subplot(4,1,2); plot(t,x32_up); title('32 kbps Compressed Voice Signal'); xlabel('Time (s)'); ylabel('Amplitude'); grid on;
subplot(4,1,3); plot(t,x8_up);  title('8 kbps Heavily Compressed Voice Signal'); xlabel('Time (s)'); ylabel('Amplitude'); grid on;
subplot(4,1,4); plot(t,x2_up);  title('2 kbps Heavily Compressed Voice Signal'); xlabel('Time (s)'); ylabel('Amplitude'); grid on;
print(gcf,[prefix 'Waveforms'],'-dpng','-r200');

%% Spectrogram comparison
figure('Name','Spectrograms','Position',[100 100 700 700]);
subplot(4,1,1); spectrogram(x64_q, 256,200,256,Fs_64,'yaxis'); title('Spectrogram: 64 kbps');
subplot(4,1,2); spectrogram(x32_up,256,200,256,Fs_64,'yaxis'); title('Spectrogram: 32 kbps');
subplot(4,1,3); spectrogram(x8_up, 256,200,256,Fs_64,'yaxis'); title('Spectrogram: 8 kbps');
subplot(4,1,4); spectrogram(x2_up, 256,200,256,Fs_64,'yaxis'); title('Spectrogram: 2 kbps');
print(gcf,[prefix 'Spectrograms'],'-dpng','-r200');

%% Save compressed versions (all at 8 kHz)
audiowrite([prefix 'voice_64kbps.wav'], x64_q,  Fs_64);
audiowrite([prefix 'voice_32kbps.wav'], x32_up, Fs_64);
audiowrite([prefix 'voice_8kbps.wav'],  x8_up,  Fs_64);
audiowrite([prefix 'voice_2kbps.wav'],  x2_up,  Fs_64);

disp('Done. Figures and 4 audio files saved.');
`;
}

// Several functionally-identical quantize_audio.m variants; one is picked at
// random for each download so no two students get an identical helper file.
export const quantizeVariants = [
`function xq = quantize_audio(x, bits)
% QUANTIZE_AUDIO  Uniform bit-depth reduction of a normalised signal in [-1,1].
L = 2^bits;                     % number of quantization levels
x = max(min(x,1),-1);           % clip to [-1, 1]
xq = round((x + 1)/2 * (L - 1));% map to integer levels 0..L-1
xq = xq/(L - 1) * 2 - 1;        % map back to [-1, 1]
end
`,
`function xq = quantize_audio(sig, nbits)
% QUANTIZE_AUDIO  Reduce the amplitude resolution of sig to nbits bits.
levels = 2^nbits - 1;                       % highest integer level
sig    = min(max(sig, -1), 1);              % keep inside [-1, 1]
codes  = round((sig * 0.5 + 0.5) * levels); % 0 .. levels
xq     = (codes / levels - 0.5) * 2;        % back to [-1, 1]
end
`,
`function y = quantize_audio(x, b)
% QUANTIZE_AUDIO  Requantise x (assumed in [-1,1]) to b bits per sample.
    x = max(min(x, 1), -1);
    step = 2 / (2^b - 1);          % spacing between adjacent levels
    y = round((x + 1) / step) * step - 1;
end
`,
`function xq = quantize_audio(x, bits)
% QUANTIZE_AUDIO  Amplitude (bit-depth) quantiser for a signal in [-1, 1].
    nLevels = 2 ^ bits;
    x = max(x, -1);  x = min(x, 1);        % hard clip
    idx = round((x + 1) * (nLevels - 1) / 2);  % integer level index
    xq  = idx * 2 / (nLevels - 1) - 1;         % reconstruct amplitude
end
`,
];

export function pickQuantize() {
  return quantizeVariants[Math.floor(Math.random() * quantizeVariants.length)];
}

export function readme(prefix, filename) {
  const pf = prefix ? prefix + "_" : "";
  return `VOICE COMPRESSION - submission bundle
=======================================

This folder was produced by the DSP portal from your voice note. It contains
everything you need for Assignment 1 (Voice Compression).

Contents
--------
  ${filename}              your original recording (mono, normalised source)
  ${pf}voice_64kbps.wav    64 kbps  (8000 Hz, 8-bit)   reference
  ${pf}voice_32kbps.wav    32 kbps  (8000 Hz, 4-bit)
  ${pf}voice_8kbps.wav      8 kbps  (4000 Hz, 2-bit, resampled up to 8 kHz)
  ${pf}voice_2kbps.wav      2 kbps  (2000 Hz, 1-bit, resampled up to 8 kHz)
  VoiceCom.m               the MATLAB script that produces the above
  quantize_audio.m         helper used by VoiceCom.m
  ${pf}Waveforms.png       waveform comparison of the four versions

How it works
------------
Bit rate = sampling frequency (samples/s) x bits per sample. Each version drops
the sampling rate and/or the bit depth so the total bit rate matches the target:

  64 kbps = 8000 x 8      32 kbps = 8000 x 4
   8 kbps = 4000 x 2       2 kbps = 2000 x 1

To reproduce / get the spectrograms
------------------------------------
Put VoiceCom.m, quantize_audio.m and your recording in the same MATLAB folder,
open VoiceCom.m and press Run. It regenerates the four WAVs plus the waveform
and spectrogram figures. The audio files in this zip were generated in the
browser and are identical in intent to the MATLAB output.
`;
}
