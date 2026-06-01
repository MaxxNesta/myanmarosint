export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-[9px] font-mono text-slate-600 tracking-[0.2em] uppercase mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Privacy Policy</h1>
        <p className="text-xs font-mono text-slate-600 mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-slate-400 leading-relaxed">

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">1. Overview</h2>
            <p>Myanmar Civil War (<strong className="text-slate-300">myanmarcivilwar.com</strong>) is a publicly accessible open-source intelligence platform. We are committed to protecting your privacy. This policy describes what information, if any, is collected when you use this site.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">2. Information We Do Not Collect</h2>
            <p>We do <strong className="text-slate-300">not</strong> collect, store, or process:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li>Personal identification information (name, email, phone number)</li>
              <li>Account credentials or user registrations</li>
              <li>Payment or financial information</li>
              <li>Location data from your device</li>
              <li>Communications or messages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">3. Anonymous Analytics</h2>
            <p>We use <strong className="text-slate-300">Vercel Analytics</strong>, a privacy-focused analytics service, to understand aggregate site usage (page views, general geographic region, device type). This data is anonymised and does not identify individual users. No cookies are used for tracking purposes.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">4. Third-Party Services</h2>
            <p>This platform uses the following third-party services to function:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
              <li><strong className="text-slate-400">Mapbox</strong> — map rendering (subject to Mapbox privacy policy)</li>
              <li><strong className="text-slate-400">Vercel</strong> — hosting and edge delivery</li>
              <li><strong className="text-slate-400">Neon</strong> — database hosting</li>
            </ul>
            <p className="mt-2">We do not sell, trade, or share any data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">5. Data Sources</h2>
            <p>All conflict data displayed on this platform is derived from publicly available open-source reporting — news feeds, Telegram channels, and geospatial datasets. No private or classified information is used.</p>
          </section>

          <section>
            <h2 className="text-xs font-mono text-slate-300 tracking-widest uppercase mb-3">6. Contact</h2>
            <p>Questions regarding this policy may be directed to the site administrators via the contact information available on the platform.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
