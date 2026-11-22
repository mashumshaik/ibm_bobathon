'use client';
import { useState } from 'react';
import Link from 'next/link';

type Service = {
  id: string;
  title: string;
  department: string;
  category: string;
  description: string;
  eligibility: string[];
  benefits: string;
  status: 'Open' | 'Closing Soon' | 'Closed';
  tags: string[];
};

const ALL_SERVICES: Service[] = [
  {
    id: 'ayushman',
    title: 'Ayushman Bharat – PM-JAY',
    department: 'Ministry of Health',
    category: 'health',
    description: 'Health cover of ₹5 lakh per family per year for secondary and tertiary hospitalisation.',
    eligibility: ['BPL family', 'SECC database listed', 'No existing health insurance'],
    benefits: 'Up to ₹5,00,000 per year',
    status: 'Open',
    tags: ['health', 'insurance', 'free'],
  },
  {
    id: 'pmkisan',
    title: 'PM-KISAN Samman Nidhi',
    department: 'Ministry of Agriculture',
    category: 'agriculture',
    description: 'Direct income support of ₹6,000/year to small and marginal farmers in three equal instalments.',
    eligibility: ['Landholding farmer', 'Not an income-tax payer', 'Not a government employee'],
    benefits: '₹6,000 per year',
    status: 'Open',
    tags: ['farmer', 'income', 'agriculture'],
  },
  {
    id: 'pmay',
    title: 'PM Awas Yojana (Urban)',
    department: 'Ministry of Housing',
    category: 'housing',
    description: 'Affordable housing scheme providing financial assistance for construction/purchase of houses.',
    eligibility: ['Annual income < ₹18 lakh', 'No pucca house owned', 'First-time applicant'],
    benefits: 'Subsidy up to ₹2.67 lakh',
    status: 'Open',
    tags: ['housing', 'subsidy', 'construction'],
  },
  {
    id: 'scholarship-nsp',
    title: 'National Scholarship Portal',
    department: 'Ministry of Education',
    category: 'education',
    description: 'Umbrella scholarship platform covering pre-matric, post-matric and merit-based scholarships.',
    eligibility: ['Student enrolled in recognised institution', 'Family income < ₹2.5 lakh/year'],
    benefits: 'Up to ₹25,000/year',
    status: 'Closing Soon',
    tags: ['student', 'scholarship', 'education'],
  },
  {
    id: 'mnrega',
    title: 'MGNREGA – Job Card',
    department: 'Ministry of Rural Development',
    category: 'employment',
    description: 'Guarantees 100 days of wage employment per year to rural households whose adult members volunteer unskilled manual work.',
    eligibility: ['Rural household', 'Adult member willing to do manual work', 'Valid job card'],
    benefits: '100 days guaranteed employment',
    status: 'Open',
    tags: ['employment', 'rural', 'wages'],
  },
  {
    id: 'widow-pension',
    title: 'National Widow Pension Scheme',
    department: 'Ministry of Social Justice',
    category: 'social',
    description: 'Monthly pension to widows from BPL families.',
    eligibility: ['Age 40–79', 'BPL household', 'Not receiving any other pension'],
    benefits: '₹300/month',
    status: 'Open',
    tags: ['pension', 'widow', 'social'],
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'health', label: '🏥 Health' },
  { value: 'education', label: '🎓 Education' },
  { value: 'employment', label: '💼 Employment' },
  { value: 'housing', label: '🏠 Housing' },
  { value: 'social', label: '👴 Social' },
  { value: 'agriculture', label: '🌾 Agriculture' },
];

const statusColor: Record<string, string> = {
  Open: 'bg-green-100 text-green-700',
  'Closing Soon': 'bg-yellow-100 text-yellow-700',
  Closed: 'bg-red-100 text-red-700',
};

export default function ServiceDiscoveryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = ALL_SERVICES.filter((s) => {
    const matchCat = category === 'all' || s.category === category;
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q));
    return matchCat && matchQ;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Government Services</h1>
        <p className="text-gray-500">Search from 500+ schemes across all departments</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search services, schemes, benefits…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <Link href="/chat" className="btn-primary whitespace-nowrap">
          ✨ Ask AI Instead
        </Link>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">{filtered.length} services found</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div key={s.id} className="card flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 leading-snug">{s.title}</h3>
              <span className={`badge whitespace-nowrap ${statusColor[s.status]}`}>{s.status}</span>
            </div>
            <p className="text-xs text-blue-600 font-medium">{s.department}</p>
            <p className="text-sm text-gray-600">{s.description}</p>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Eligibility</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {s.eligibility.map((e) => <li key={e}>• {e}</li>)}
              </ul>
            </div>
            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-green-700">{s.benefits}</span>
              <Link href={`/apply?service=${s.id}`} className="btn-primary !py-1.5 !px-3 text-xs">
                Apply Now →
              </Link>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-medium">No services found for your search.</p>
          <Link href="/chat" className="mt-4 inline-block text-blue-600 text-sm hover:underline">
            Ask our AI assistant instead →
          </Link>
        </div>
      )}
    </div>
  );
}
