import Link from 'next/link';

const services = [
  { icon: '🏥', title: 'Healthcare', desc: 'Health insurance, Ayushman Bharat, medical aid schemes', href: '/service-discovery?cat=health' },
  { icon: '🎓', title: 'Education', desc: 'Scholarships, student loans, skill development programs', href: '/service-discovery?cat=education' },
  { icon: '💼', title: 'Employment', desc: 'Job registration, unemployment benefits, MNREGA', href: '/service-discovery?cat=employment' },
  { icon: '🏠', title: 'Housing', desc: 'PM Awas Yojana, rental assistance, land records', href: '/service-discovery?cat=housing' },
  { icon: '👴', title: 'Pension & Social', desc: 'Old-age pension, widow benefits, disability support', href: '/service-discovery?cat=social' },
  { icon: '🌾', title: 'Agriculture', desc: 'PM-KISAN, crop insurance, irrigation subsidies', href: '/service-discovery?cat=agriculture' },
];

const steps = [
  { n: '01', title: 'Describe your need', desc: 'Tell our AI assistant about your situation in plain language.' },
  { n: '02', title: 'Discover eligibility', desc: 'The agent scans all relevant schemes and shows what you qualify for.' },
  { n: '03', title: 'Apply with guidance', desc: 'Fill forms with AI assistance and validate your documents upfront.' },
  { n: '04', title: 'Track in real time', desc: 'Get status updates and next-step nudges automatically.' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium mb-6">
            Powered by IBM watsonx AI
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Your Government Services,<br />
            <span className="text-blue-200">Simplified by AI</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Prajaakeeya is an AI-powered citizen service portal that helps you discover benefits,
            complete applications, validate documents, and track status — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat" className="btn-primary text-base px-8 py-3">
              ✨ Ask AI Assistant
            </Link>
            <Link href="/service-discovery" className="btn-secondary text-base px-8 py-3 !text-white !border-white/40 !bg-white/10 hover:!bg-white/20">
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { n: '500+', label: 'Government Schemes' },
            { n: '12M+', label: 'Citizens Served' },
            { n: '94%', label: 'Application Success Rate' },
            { n: '<2 min', label: 'Average Eligibility Check' },
          ].map(({ n, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-blue-700">{n}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Explore Services by Category</h2>
          <p className="text-gray-500 mt-2">Find schemes and benefits across all government departments</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="card hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">From confusion to completion in four simple steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg mb-4">
                  {n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="rounded-2xl bg-blue-700 text-white px-8 py-14">
          <h2 className="text-3xl font-bold mb-4">Not sure where to start?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            Describe your situation to our AI agent and let it find the right services for you — in your language.
          </p>
          <Link href="/chat" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
            Start Conversation →
          </Link>
        </div>
      </section>
    </>
  );
}
