'use client';
import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'agent';
  text: string;
  links?: { label: string; href: string }[];
};

const RESPONSES: { match: string[]; reply: string; links?: { label: string; href: string }[] }[] = [
  {
    match: ['job', 'employment', 'work', 'unemployed', 'lost job'],
    reply: 'I found 3 schemes that may help you with employment support:\n\n• **MGNREGA** – Guarantees 100 days of employment for rural households.\n• **PM Rojgar Protsahan Yojana** – Employer subsidy for new hires.\n• **Pradhan Mantri Kaushal Vikas Yojana** – Free skill training with job placement.\n\nWould you like to check eligibility or apply?',
    links: [{ label: 'View Employment Services', href: '/service-discovery?cat=employment' }],
  },
  {
    match: ['health', 'hospital', 'medical', 'insurance', 'treatment'],
    reply: 'For healthcare assistance, here are the top schemes:\n\n• **Ayushman Bharat – PM-JAY** – ₹5 lakh/year health cover for BPL families.\n• **CGHS** – Central government health scheme for employees.\n• **State health missions** – Additional top-up coverage.\n\nShall I check your eligibility for Ayushman Bharat?',
    links: [{ label: 'Apply for Ayushman Bharat', href: '/apply?service=ayushman' }],
  },
  {
    match: ['farm', 'farmer', 'crop', 'agriculture', 'kisan'],
    reply: 'For farmers, the following schemes are available:\n\n• **PM-KISAN** – ₹6,000/year direct income support.\n• **PM Fasal Bima Yojana** – Crop insurance at subsidised rates.\n• **Kisan Credit Card** – Low-interest credit for farming needs.\n\nAre you a small or marginal farmer?',
    links: [{ label: 'Apply for PM-KISAN', href: '/apply?service=pmkisan' }],
  },
  {
    match: ['house', 'home', 'housing', 'shelter', 'rent'],
    reply: 'Here are the housing schemes you may qualify for:\n\n• **PM Awas Yojana (Urban)** – Subsidy up to ₹2.67 lakh for first-time homebuyers.\n• **PM Awas Yojana (Rural)** – Full construction grant for rural households.\n• **CLSS** – Credit-linked subsidy on home loans.\n\nWould you like to check if you qualify?',
    links: [{ label: 'Apply for PM Awas Yojana', href: '/apply?service=pmay' }],
  },
  {
    match: ['scholarship', 'study', 'student', 'education', 'college', 'school'],
    reply: 'For educational support, the following scholarships are available:\n\n• **National Scholarship Portal** – Pre-matric and post-matric scholarships up to ₹25,000/year.\n• **PM Vidyalaxmi** – Low-interest education loans.\n• **Skill India Scheme** – Free vocational training for youth.\n\nWhat is your current level of education?',
    links: [{ label: 'Browse Education Schemes', href: '/service-discovery?cat=education' }],
  },
  {
    match: ['pension', 'old age', 'elderly', 'senior', 'widow', 'disabled'],
    reply: 'For social security support:\n\n• **National Social Assistance Programme** – Monthly pension for elderly, widow, and disabled.\n• **Indira Gandhi National Old Age Pension** – ₹200–500/month for BPL elders.\n• **National Widow Pension Scheme** – ₹300/month for widows aged 40–79.\n\nWhich category best describes you?',
    links: [{ label: 'View Social Schemes', href: '/service-discovery?cat=social' }],
  },
  {
    match: ['track', 'status', 'application', 'check'],
    reply: 'To track your application, you need your Application ID (e.g. **APP-DEMO01**).\n\nYou can also try the demo applications:\n• APP-DEMO01 – In progress (Documents Verified)\n• APP-DEMO02 – Completed (Disbursed)',
    links: [{ label: 'Go to Status Tracker', href: '/status' }],
  },
];

const GREETING: Message = {
  role: 'agent',
  text: 'Namaste! 🙏 I am your AI-powered citizen services assistant, powered by IBM watsonx.\n\nI can help you:\n• **Discover** government schemes you qualify for\n• **Apply** for benefits with step-by-step guidance\n• **Track** your applications in real time\n• **Validate** your documents before submission\n\nWhat brings you here today? You can describe your situation in simple words.',
};

function getReply(input: string): Message {
  const lower = input.toLowerCase();
  for (const r of RESPONSES) {
    if (r.match.some((kw) => lower.includes(kw))) {
      return { role: 'agent', text: r.reply, links: r.links };
    }
  }
  return {
    role: 'agent',
    text: 'Thank you for sharing that. Let me search our database of 500+ government schemes for the best matches.\n\nBased on what you told me, I recommend browsing by category or describing your need a bit more — for example:\n• "I lost my job and need financial help"\n• "I am a farmer looking for income support"\n• "I need help with hospital bills"',
    links: [{ label: 'Browse All Services', href: '/service-discovery' }],
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, getReply(text)]);
      setLoading(false);
    }, 900);
  };

  const SUGGESTIONS = ['I lost my job', 'I need health insurance', 'I am a farmer', 'Housing scheme'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="card mb-4 flex items-center gap-3 !py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">🤖</div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Prajaakeeya AI Assistant</p>
          <p className="text-xs text-green-600 font-medium">● Online — Powered by IBM watsonx</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
            }`}>
              {msg.text.split('\n').map((line, j) => (
                <p key={j} className={line === '' ? 'h-2' : ''}>
                  {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={k}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                </p>
              ))}
              {msg.links && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.links.map(({ label, href }) => (
                    <a
                      key={href}
                      href={href}
                      className="inline-block rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      {label} →
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Describe your situation or ask a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="btn-primary !px-5 !py-3 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
