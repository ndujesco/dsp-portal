"use client";
import { useRef, useState } from "react";
import { decodeToMono, compress, encodeWav } from "../lib/audio";
import { voiceComM, pickQuantize } from "../lib/files";

const RATES = [
  { key: "x64", label: "64 kbps", sub: "8000 Hz · 8-bit · reference" },
  { key: "x32", label: "32 kbps", sub: "8000 Hz · 4-bit" },
  { key: "x8", label: "8 kbps", sub: "4000 Hz · 2-bit" },
  { key: "x2", label: "2 kbps", sub: "2000 Hz · 1-bit" },
];

function drawWaveforms(tracks, sampleRate) {
  const W = 900, laneH = 150, pad = 34, H = laneH * 4 + pad;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  const line = "#1f3a52";
  RATES.forEach((r, i) => {
    const y0 = i * laneH + pad;
    const data = tracks[r.key];
    g.strokeStyle = "#e7e4dd"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(40, y0 + laneH / 2); g.lineTo(W - 10, y0 + laneH / 2); g.stroke();
    g.strokeStyle = line; g.lineWidth = 1; g.beginPath();
    const step = Math.max(1, Math.floor(data.length / (W - 60)));
    let x = 40;
    for (let j = 0; j < data.length; j += step) {
      const v = data[j];
      const y = y0 + laneH / 2 - v * (laneH / 2 - 8);
      if (j === 0) g.moveTo(x, y); else g.lineTo(x, y);
      x += (W - 60) / (data.length / step);
    }
    g.stroke();
    g.fillStyle = "#17191c"; g.font = "600 14px Inter, sans-serif";
    g.fillText(r.label + "  (" + r.sub + ")", 40, y0 - 8);
  });
  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}

export default function VoiceTool() {
  const [status, setStatus] = useState("idle"); // idle|working|ready|error
  const [msg, setMsg] = useState("");
  const [prefix, setPrefix] = useState("");
  const [origName, setOrigName] = useState("voice.wav");
  const [players, setPlayers] = useState([]);
  const [zipUrl, setZipUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  async function handleBuffer(arrayBuffer, sourceName, sourceBytes) {
    try {
      setStatus("working"); setMsg("Decoding audio…"); setZipUrl(null); setPlayers([]);
      const { data, sampleRate } = await decodeToMono(arrayBuffer);
      if (!data.length) throw new Error("empty audio");
      setMsg("Compressing to 64 / 32 / 8 / 2 kbps…");
      await new Promise((r) => setTimeout(r, 30));
      const out = compress(data, sampleRate);

      // encode WAVs
      const wavs = {};
      RATES.forEach((r) => { wavs[r.key] = encodeWav(out[r.key], out.sampleRate); });

      // inline players
      const pl = RATES.map((r) => ({
        ...r,
        url: URL.createObjectURL(new Blob([wavs[r.key]], { type: "audio/wav" })),
      }));
      setPlayers(pl);

      // waveform image
      setMsg("Rendering waveform figure…");
      const wfBlob = await drawWaveforms(out, out.sampleRate);
      const wfBuf = new Uint8Array(await wfBlob.arrayBuffer());

      // build zip
      setMsg("Packing the submission zip…");
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const pf = prefix ? prefix.trim().replace(/\s+/g, "_") + "_" : "";
      const orig = sourceName || "voice.wav";
      zip.file(orig, sourceBytes);
      zip.file(pf + "voice_64kbps.wav", wavs.x64);
      zip.file(pf + "voice_32kbps.wav", wavs.x32);
      zip.file(pf + "voice_8kbps.wav", wavs.x8);
      zip.file(pf + "voice_2kbps.wav", wavs.x2);
      zip.file("VoiceCom.m", voiceComM(prefix.trim().replace(/\s+/g, "_"), orig));
      zip.file("quantize_audio.m", pickQuantize());
      zip.file(pf + "Waveforms.png", wfBuf);
      const blob = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(blob));
      setStatus("ready"); setMsg("Done. " + out.N + " samples per track at 8 kHz.");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setMsg("Could not process that file. Try a normal audio recording (wav / m4a / mp3 / webm).");
    }
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setOrigName(f.name);
    const buf = await f.arrayBuffer();
    handleBuffer(buf, f.name, new Uint8Array(buf.slice(0)));
  }

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => ev.data.size && chunksRef.current.push(ev.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
        const name = "recording.webm";
        setOrigName(name);
        const buf = await blob.arrayBuffer();
        handleBuffer(buf, name, new Uint8Array(buf.slice(0)));
      };
      recRef.current = mr; mr.start(); setRecording(true);
    } catch (e) {
      setStatus("error"); setMsg("Microphone permission was blocked.");
    }
  }
  function stopRec() { recRef.current?.stop(); setRecording(false); }

  const busy = status === "working";
  return (
    <div className="voice">
      <div className="controls">
        <label className="field">
          <span>Name / matric on the files (optional)</span>
          <input value={prefix} onChange={(e) => setPrefix(e.target.value)}
                 placeholder="e.g. 210403513" disabled={busy} />
        </label>
        <div className="btnrow">
          <label className={"btn primary" + (busy ? " disabled" : "")}>
            Upload voice note
            <input type="file" accept="audio/*" onChange={onFile} disabled={busy} hidden />
          </label>
          {!recording ? (
            <button className="btn" onClick={startRec} disabled={busy}>● Record</button>
          ) : (
            <button className="btn rec" onClick={stopRec}>■ Stop recording</button>
          )}
        </div>
      </div>

      {status !== "idle" && (
        <div className={"statusline " + status}>
          {busy && <span className="spinner" />} {msg}
        </div>
      )}

      {players.length > 0 && (
        <div className="players">
          {players.map((p) => (
            <div className="player" key={p.key}>
              <div className="plabel"><b>{p.label}</b><span>{p.sub}</span></div>
              <audio controls preload="none" src={p.url} />
            </div>
          ))}
        </div>
      )}

      {zipUrl && (
        <a className="btn download" href={zipUrl}
           download={(prefix.trim().replace(/\s+/g, "_") || "voice") + "_Voice_Compression.zip"}>
          ↓ Download submission zip
        </a>
      )}
    </div>
  );
}
