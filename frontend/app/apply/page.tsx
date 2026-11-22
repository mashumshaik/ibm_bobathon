'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const SERVICE_LABELS: Record<string, string> = {
  ayushman: 'Ayushman Bharat – PM-JAY',
  pmkisan: 'PM-KISAN Samman Nidhi',
  pmay: 'PM Awas Yojana (Urban)',
  'scholarship-nsp': 'National Scholarship Portal',
  mnrega: 'MGNREGA – Job Card',
  'widow-pension': 'National Widow Pension Scheme',
};

type Step = 'personal' | 'documents' | 'review' | 'submitted';

function ApplicationForm() {
  const params = useSearchParams();
  const serviceId = params.get('service') ?? '';
  const serviceLabel = SERVICE_LABELS[serviceId] ?? 'General Application';

  const [step, setStep] = useState<Step>('personal');
  const [form, setForm] = useState({
    name: '', dob: '', gender: '', aadhaar: '', mobile: '', email: '',
    address: '', district: '', state: '', pincode: '',
    income: '', category: '', occupation: '',
  });
  const [docs, setDocs] = useState<{ [k: string]: File | null }>({
    aadhaarCard: null,
    incomeProof: null,
    photo: null,
    bankPassbook: null,
  });
  const [docStatus, setDocStatus] = useState<{ [k: string]: 'pending' | 'valid' | 'invalid' }>({
    aadhaarCard: 'pending',
    incomeProof: 'pending',
    photo: 'pending',
    bankPassbook: 'pending',
  });
  const [applicationId, setApplicationId] = useState('');

  const handleField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleDocUpload = (key: string, file: File | null) => {
    setDocs((d) => ({ ...d, [key]: file }));
    if (file) {
      // Simulate AI document validation
      setTimeout(() => {
        setDocStatus((s) => ({ ...s, [key]: file.size > 100 ? 'valid' : 'invalid' }));
      }, 1200);
    }
  };

  const handleSubmit = () => {
    const id = 'APP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setApplicationId(id);
    setStep('submitted');
  };

  const DOC_LABELS: Record<string, string> = {
    aadhaarCard: 'Aadhaar Card (PDF/JPG)',
    incomeProof: 'Income Certificate (PDF)',
    photo: 'Passport Photo (JPG)',
    bankPassbook: 'Bank Passbook (PDF/JPG)',
  };

  const statusIcon: Record<string, string> = {
    pending: '⏳',
    valid: '✅',
    invalid: '❌',
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-blue-600 font-medium mb-1">Applying for</p>
        <h1 className="text-2xl font-bold text-gray-900">{serviceLabel}</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10 text-sm">
        {(['personal', 'documents', 'review'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step === s ? 'bg-blue-600 text-white' :
              ['submitted', 'review', 'documents'].indexOf(step) > ['submitted', 'review', 'documents'].indexOf(s)
                ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
            }`}>{i + 1}</div>
            <span className={step === s ? 'text-blue-700 font-semibold' : 'text-gray-400'}>
              {s === 'personal' ? 'Personal Info' : s === 'documents' ? 'Documents' : 'Review'}
            </span>
            {i < 2 && <span className="text-gray-300 mx-1">›</span>}
          </div>
        ))}
      </div>

      {step === 'personal' && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-900 text-lg">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { k: 'name', label: 'Full Name', type: 'text', placeholder: 'As per Aadhaar' },
              { k: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },
              { k: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile' },
              { k: 'email', label: 'Email Address', type: 'email', placeholder: 'Optional' },
              { k: 'aadhaar', label: 'Aadhaar Number', type: 'text', placeholder: 'XXXX XXXX XXXX' },
              { k: 'income', label: 'Annual Family Income (₹)', type: 'number', placeholder: 'e.g. 150000' },
            ].map(({ k, label, type, placeholder }) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[k]}
                  onChange={(e) => handleField(k, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleField('gender', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleField('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button onClick={() => setStep('documents')} className="btn-primary">
              Next: Documents →
            </button>
          </div>
        </div>
      )}

      {step === 'documents' && (
        <div className="card space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Upload Documents</h2>
            <p className="text-sm text-gray-500 mt-1">Our AI validates each document automatically after upload.</p>
          </div>
          <div className="space-y-4">
            {Object.keys(DOC_LABELS).map((key) => (
              <div key={key} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{DOC_LABELS[key]}</label>
                  {docs[key] && (
                    <span className="text-sm">
                      {statusIcon[docStatus[key]]}{' '}
                      <span className={docStatus[key] === 'valid' ? 'text-green-600' : docStatus[key] === 'invalid' ? 'text-red-600' : 'text-gray-400'}>
                        {docStatus[key] === 'valid' ? 'Verified' : docStatus[key] === 'invalid' ? 'Invalid – re-upload' : 'Validating…'}
                      </span>
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocUpload(key, e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-between">
            <button onClick={() => setStep('personal')} className="btn-secondary">← Back</button>
            <button onClick={() => setStep('review')} className="btn-primary">Review Application →</button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-900 text-lg">Review & Submit</h2>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
            <p><span className="font-medium text-gray-600">Service:</span> {serviceLabel}</p>
            <p><span className="font-medium text-gray-600">Applicant:</span> {form.name || '—'}</p>
            <p><span className="font-medium text-gray-600">Mobile:</span> {form.mobile || '—'}</p>
            <p><span className="font-medium text-gray-600">Aadhaar:</span> {form.aadhaar ? `XXXX XXXX ${form.aadhaar.slice(-4)}` : '—'}</p>
            <p><span className="font-medium text-gray-600">Annual Income:</span> {form.income ? `₹${Number(form.income).toLocaleString('en-IN')}` : '—'}</p>
            <p><span className="font-medium text-gray-600">Documents:</span>{' '}
              {Object.entries(docStatus).filter(([, v]) => v === 'valid').length} / {Object.keys(docStatus).length} verified
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <strong>AI Pre-check:</strong> Based on your inputs, you appear eligible for this scheme.
            Submitting now will route your application for final verification within 3 working days.
          </div>
          <div className="pt-4 flex justify-between">
            <button onClick={() => setStep('documents')} className="btn-secondary">← Back</button>
            <button onClick={handleSubmit} className="btn-primary">Submit Application ✓</button>
          </div>
        </div>
      )}

      {step === 'submitted' && (
        <div className="card text-center py-10 space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
          <p className="text-gray-500">Your application has been received and is under review.</p>
          <div className="inline-block rounded-lg bg-blue-50 border border-blue-200 px-6 py-3">
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Application ID</p>
            <p className="text-xl font-bold text-blue-700 mt-1">{applicationId}</p>
          </div>
          <p className="text-sm text-gray-500">Save this ID to track your application status.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a href={`/status?id=${applicationId}`} className="btn-primary">Track Status →</a>
            <a href="/service-discovery" className="btn-secondary">Browse More Services</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
      <ApplicationForm />
    </Suspense>
  );
}
