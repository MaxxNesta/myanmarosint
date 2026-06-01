export const metadata = {
  title: 'Disclaimer',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-[9px] font-mono text-slate-600 tracking-[0.2em] uppercase mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Disclaimer</h1>
        <p className="text-xs font-mono text-slate-600 mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-slate-400 leading-relaxed">

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">1. No Affiliation</h2>
            <p><strong className="text-slate-300">myanmarcivilwar.com</strong> is an independent open-source intelligence platform. It is <strong className="text-slate-300">not affiliated with, endorsed by, or funded by</strong> any government, military organisation, political party, armed group, intelligence agency, or non-governmental organisation — including but not limited to the Tatmadaw, NUG, SAC, PDF, any EAO, or any foreign government.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">2. Accuracy of Information</h2>
            <p>All conflict data on this platform is:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Derived entirely from <strong className="text-slate-400">publicly available open sources</strong> — news outlets, public Telegram channels, and open geospatial datasets</li>
              <li>Processed using AI-assisted extraction (Groq, DeepSeek) which <strong className="text-slate-400">may introduce errors</strong> in event classification, location, casualty figures, or actor identification</li>
              <li>Subject to the biases and limitations of the underlying source material</li>
              <li>Not independently verified by human analysts for every event</li>
            </ul>
            <p className="mt-3">We make no warranties, express or implied, as to the completeness, accuracy, reliability, or timeliness of any information displayed.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">3. Not for Operational Use</h2>
            <p>Data on this platform is <strong className="text-slate-300">strictly for informational and research purposes</strong>. It must not be used for military targeting, weapons deployment, search and rescue operations, medical triage, evacuation planning, or any other purpose where inaccurate information could result in harm or loss of life. Always consult authoritative sources and qualified professionals for operational decisions.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">4. AI-Generated Content</h2>
            <p>Event summaries, actor identifications, and risk scores on this platform are generated using large language models. AI-generated content can contain <strong className="text-slate-300">hallucinations, misclassifications, and factual errors</strong>. Each event displays a confidence score to indicate estimated reliability — low-confidence events should be treated with additional scrutiny.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">5. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, the operators of this platform shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of or reliance on information contained herein. Use of this platform is entirely at your own risk.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">6. Source Attribution</h2>
            <p>Where source URLs are shown, they link to third-party publications. We do not control the content of external sites and make no representations about their accuracy. Attribution to a source does not imply endorsement of that source&apos;s editorial position or bias assessment.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">7. Sensitive Content</h2>
            <p>This platform contains information about armed conflict, casualties, displacement, and human rights violations. Content may be distressing. Reader discretion is advised.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
