'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type Status = 'submitted' | 'under_review' | 'documents_verified' | 'approved' | 'disbursed';

const MOCK_APPS: Record<string, {
  service: string;
  applicant: string;
  submitted: string;
  status: Status;
  timeline: { date: string; event: string; note?: string }[];
}> = {
  'APP-DEMO01': {
    service: 'Ayushman Bharat – PM-JAY',
    applicant: 'Ramesh Kumar',
    submitted: '2026-11-15',
    status: 'documents_verified',
    timeline: [
      { date: '2026-11-15', event: 'Application Submitted', note: 'All documents uploaded successfully.' },
      { date: '2026-11-16', event: 'Under Review', note: 'Assigned to district health officer.' },
      { date: '2026-11-18', event: 'Documents Verified', note: 'AI document check passed. Awaiting final approval.' },
    ],
  },
  'APP-DEMO02': {
    service: 'PM-KISAN Samman Nidhi',
    applicant: 'Surekha Devi',
    submitted: '2026-11-10',
    status: 'disbursed',
    timeline: [
      { date: '2026-11-10', event: 'Application Submitted' },
      { date: '2026-11-11', event: 'Under Review' },
      { date: '2026-11-13', event: 'Documents Verified' },
      { date: '2026-11-14', event: 'Approved', note: 'Eligibility confirmed by block officer.' },
      { date: '2026-11-16', event: 'Amount Disbursed', note: '₹2,000 credited to bank account ending XXXX.' },
    ],
  },
};

const STEPS: { key: Status; label: string; icon: string }[] = [
  { key: 'submitted', label: 'Submitted', icon: '📤' },
  { key: 'under_review', label: 'Under Review', icon: '🔍' },
  { key: 'documents_verified', label: 'Docs Verified', icon: '✅' },
  { key: 'approved', label: 'Approved', icon: '👍' },
  { key: 'disbursed', label: 'Disbursed', icon: '💰' },
];

const STATUS_ORDER: Status[] = ['submitted', 'under_review', 'documents_verified', 'approved', 'disbursed'];

function StatusTracker() {
  const params = useSearchParams();
  const initId = params.get('id') ?? '';
  const [inputId, setInputId] = useState(initId);
  const [searched, setSearched] = useState(!!initId);
  const app = MOCK_APPS[inputId.toUpperCase()];

  const currentIdx = app ? STATUS_ORDER.indexOf(app.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Application</h1>
        <p className="text-gray-500">Enter your Application ID to see the current status.</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-10">
        <input
          type="text"
          placeholder="e.g. APP-DEMO01"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onClick={() => setSearched(true)} className="btn-primary">Track →</button>
      </div>

      {searched && !app && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔎</p>
          <p className="font-medium">No application found for <code className="bg-gray-100 px-2 py-0.5 rounded">{inputId}</code></p>
          <p className="text-sm mt-2">Try <strong>APP-DEMO01</strong> or <strong>APP-DEMO02</strong> for a demo.</p>
        </div>
      )}

      {app && (
        <div className="space-y-8">
          {/* Summary card */}
          <div className="card flex flex-col sm:flex-row gap-6 justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Application ID</p>
              <p className="font-mono text-lg font-bold text-gray-900">{inputId.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Service</p>
              <p className="text-sm font-semibold text-gray-800">{app.service}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Applicant</p>
              <p className="text-sm text-gray-800">{app.applicant}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Submitted</p>
              <p className="text-sm text-gray-800">{app.submitted}</p>
            </div>
          </div>

          {/* Progress stepper */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-6">Application Progress</h2>
            <div className="flex items-start justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-8 z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-blue-500 mx-8 z-0 transition-all"
                style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map(({ key, label, icon }, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={key} className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg border-2 ${
                      done ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-400'
                    } ${active ? 'ring-4 ring-blue-100' : ''}`}>
                      {icon}
                    </div>
                    <span className={`text-xs text-center leading-tight ${done ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-5">Activity Timeline</h2>
            <div className="space-y-5">
              {app.timeline.map(({ date, event, note }, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mt-1" />
                    {i < app.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900 text-sm">{event}</p>
                      <span className="text-xs text-gray-400">{date}</span>
                    </div>
                    {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
      <StatusTracker />
    </Suspense>
  );
}
