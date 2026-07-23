import VoiceTool from "../components/VoiceTool";

const DOCS = [
  {
    n: 2,
    title: "Generation of Digital Signals & Spectral Analysis",
    tag: "Pre-Lab 1",
    blurb: "White noise, sums and products of sinusoids, and speech — analysed with the FFT.",
    question: "pdfs/asg2-question.pdf",
    answer: "pdfs/asg2-answer.pdf",
  },
  {
    n: 3,
    title: "Z-transfer Functions & FIR Filters",
    tag: "Lab 1",
    blurb: "Difference equations, FIR transfer functions, frequency responses and digital filtering.",
    question: "pdfs/asg3-question.pdf",
    answer: "pdfs/asg3-answer.pdf",
  },
  {
    n: 4,
    title: "FIR Filter Design (Group Project)",
    tag: "Group Project",
    blurb: "The group filter-design report and its accompanying lab handout.",
    question: "pdfs/asg4-question.pdf",
    answer: "pdfs/asg4-answer.pdf",
  },
];

function DocCard({ d }) {
  return (
    <section className="card">
      <div className="cardhead">
        <span className="badge">Assignment {d.n}</span>
        <span className="tag">{d.tag}</span>
      </div>
      <h3>{d.title}</h3>
      <p className="blurb">{d.blurb}</p>
      <div className="doclinks">
        {d.question && (
          <>
            <a className="btn ghost" href={d.question} target="_blank" rel="noreferrer">View question</a>
            <a className="btn ghost" href={d.question} download>Download question</a>
          </>
        )}
        <a className="btn primary" href={d.answer} target="_blank" rel="noreferrer">View answer</a>
        <a className="btn primary" href={d.answer} download>Download answer</a>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <header className="hero">
        <div className="wrap">
          <p className="kicker">Digital Signal Processing</p>
          <h1>Assignment Portal</h1>
          <p className="lede">
            Question sheets and worked answers for Assignments 2–4, plus a browser tool that turns
            any voice note into the full Assignment&nbsp;1 (voice-compression) submission — no MATLAB
            needed to get the audio.
          </p>
        </div>
      </header>

      <div className="wrap grid">
        {/* Assignment 1 — the tool */}
        <section className="card feature">
          <div className="cardhead">
            <span className="badge accent">Assignment 1</span>
            <span className="tag">Voice Compression</span>
          </div>
          <h3>Make your voice-compression submission</h3>
          <p className="blurb">
            Upload a voice note (or record one). It is compressed to 64, 32, 8 and 2&nbsp;kbps in your
            browser, and you get a zip with the four WAVs, the MATLAB code and a waveform figure —
            ready to hand in. Nothing is uploaded to a server.
          </p>
          <VoiceTool />
        </section>

        {DOCS.map((d) => <DocCard key={d.n} d={d} />)}
      </div>

      <footer className="foot">
        <div className="wrap">
          <p>Runs entirely in your browser · audio never leaves your device.</p>
        </div>
      </footer>
    </main>
  );
}
