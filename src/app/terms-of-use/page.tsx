export const metadata = {
  title: 'Terms of Use',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-[9px] font-mono text-slate-600 tracking-[0.2em] uppercase mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Terms of Use</h1>
        <p className="text-xs font-mono text-slate-600 mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-slate-400 leading-relaxed">

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">1. Acceptance</h2>
            <p>By accessing <strong className="text-slate-300">myanmarcivilwar.com</strong>, you agree to be bound by these Terms of Use. If you do not agree, please discontinue use of this platform immediately.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">2. Purpose and Permitted Use</h2>
            <p>This platform is provided solely for <strong className="text-slate-300">informational, educational, and research purposes</strong>. Permitted uses include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Academic research and journalism</li>
              <li>Humanitarian and human rights documentation</li>
              <li>Independent conflict monitoring and analysis</li>
              <li>Personal non-commercial use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">3. Prohibited Use</h2>
            <p>You may <strong className="text-slate-300">not</strong> use this platform for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Military targeting, weapons deployment planning, or any operational military purpose</li>
              <li>Inciting violence, harassment, or discrimination against any individual or group</li>
              <li>Redistribution or resale of data without express written permission</li>
              <li>Automated scraping or bulk data extraction beyond reasonable personal use</li>
              <li>Any activity that violates applicable local, national, or international law</li>
              <li>Propaganda or disinformation campaigns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">4. Intellectual Property</h2>
            <p>Event data displayed on this platform is derived from publicly available open-source reporting and is subject to the original publishers' rights. Platform design, code, and analysis tooling are the property of the site operators. Conflict data may be cited for non-commercial purposes with attribution to <em>myanmarcivilwar.com</em>.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">5. Accuracy and Updates</h2>
            <p>Information on this platform is updated regularly but may not reflect the most current ground situation. Conflict data is AI-processed from open sources and may contain errors. Do not rely on this data for time-critical decision-making without independent verification.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">6. Modification of Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">7. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with applicable international law and the laws of the jurisdiction in which the platform operators are based.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
