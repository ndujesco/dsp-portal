import VoiceTool from "../components/VoiceTool";
import CopyPrompt from "../components/CopyPrompt";

const DOCS = [
  {
    n: 2,
    title: "Generation of Digital Signals & Spectral Analysis",
    tag: "Pre-Lab 1",
    blurb: "White noise, sums and products of sinusoids, and speech, analysed with the FFT.",
    question: { href: "pdfs/asg2-question.pdf", name: "Prelab1.pdf" },
    answer: { href: "pdfs/asg2-answer.pdf", name: "Prelab1_Report.pdf" },
  },
  {
    n: 3,
    title: "Z-transfer Functions & FIR Filters",
    tag: "Lab 1",
    blurb: "Difference equations, FIR transfer functions, frequency responses and digital filtering.",
    question: { href: "pdfs/asg3-question.pdf", name: "Lab001.pdf" },
    answer: { href: "pdfs/asg3-answer.pdf", name: "Lab001_Report.pdf" },
  },
  {
    n: 4,
    title: "FIR Filter Design (Group Project)",
    tag: "Group Project",
    blurb: "The group filter-design report and its accompanying lab handout.",
    question: { href: "pdfs/asg4-question.pdf", name: "Lab002.pdf" },
    answer: { href: "pdfs/asg4-answer.pdf", name: "FIR_Filter_Design_Report.pdf" },
  },
];

const AI_PROMPT = `You are helping me turn a shared Digital Signal Processing lab report into my own personalised submission. I will paste a report whose technical content (results, numbers, equations, tables, MATLAB code and conclusions) is correct and must stay factually identical. Do the following:

1. Rewrite ALL of the prose in your own words. Change the sentence structure, phrasing, order and flow so none of the wording matches the original, while keeping every technical fact, value, equation and conclusion exactly the same. Re-caption the figures and tables in your own words too.

2. Give it a completely different look from the original:
   - choose a different colour scheme (and avoid the original's colours),
   - use different fonts for the headings and body,
   - use a different layout / heading style, and feel free to change the document type entirely (e.g. a Word-style two-column layout, a minimalist single-column template, or a different report format).

3. If you are able to regenerate the plots, redraw them in different colours (still clearly MATLAB-style) so even the figures do not match. Otherwise keep the existing figures.

4. Add a clean title block at the top with my details:
   Name: [YOUR FULL NAME]
   Matric No.: [YOUR MATRIC NUMBER]
   Course: [COURSE CODE]

5. Keep it clean, academic and consistent. Do NOT invent new results or change any technical value.

Output the fully reworded report with the new styling described (or applied), ready for me to export as a PDF.`;

function DocCard({ d }) {
  return (
    <section className="card">
      <div className="cardhead">
        <span className="badge">Assignment {d.n}</span>
        <span className="tag">{d.tag}</span>
      </div>
      <h3>{d.title}</h3>
      <p className="blurb">{d.blurb}</p>
      <div className="linkgroup">
        <span className="grouplabel">Question</span>
        <a className="btn" href={d.question.href} target="_blank" rel="noreferrer">View</a>
        <a className="btn" href={d.question.href} download={d.question.name}>Download</a>
      </div>
      <div className="linkgroup">
        <span className="grouplabel">Answer</span>
        <a className="btn primary" href={d.answer.href} target="_blank" rel="noreferrer">View</a>
        <a className="btn primary" href={d.answer.href} download={d.answer.name}>Download</a>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <header className="hero">
        <div className="wrap">
          <div className="mark">
            <span className="tile"><i style={{ height: 8 }} /><i style={{ height: 14 }} /><i style={{ height: 10 }} /></span>
            <b>DSP</b>
          </div>
          <h1>Assignment Portal</h1>
          <p className="lede">
            Question sheets and worked answers for Assignments 2–4, plus a browser tool that turns any
            voice note into the full Assignment&nbsp;1 (voice-compression) submission, with no MATLAB
            needed to get the audio.
          </p>
          <div className="rule" />
        </div>
      </header>

      <div className="wrap grid">
        <section className="card feature">
          <div className="cardhead">
            <span className="badge">Assignment 1</span>
            <span className="tag">Voice Compression</span>
          </div>
          <h3>Make your voice-compression submission</h3>
          <p className="blurb">
            Upload a voice note (or record one). It is compressed to 64, 32, 8 and 2&nbsp;kbps, and you
            get all the files zipped and ready for submission: the four WAVs, the MATLAB code and a
            waveform figure.
          </p>
          <VoiceTool />
        </section>

        {DOCS.map((d) => <DocCard key={d.n} d={d} />)}
      </div>

      <section className="advisory">
        <h3>Before you submit, make it your own</h3>
        <p>
          These worked answers are a study aid. Do not hand one in unchanged, and do not submit the same
          version as anyone else. At the very least:
        </p>
        <ul>
          <li>change the colour scheme, the fonts and the layout (even switch the document type);</li>
          <li>reword the writing so it is in your own voice;</li>
          <li>put your own name and matric number on it;</li>
          <li>if you can, regenerate the plots in different colours.</li>
        </ul>
        <p>Paste a report into any AI assistant with this prompt to personalise it quickly:</p>
        <CopyPrompt text={AI_PROMPT} />
      </section>

      <footer className="foot">
        <div className="wrap">
          <p>Everything is generated right here and zipped for you, ready to submit.</p>
        </div>
      </footer>
    </main>
  );
}
