'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.email.trim()) e.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (!form.subject.trim()) e.subject = 'Please enter a subject.';
    if (!form.message.trim()) e.message = 'Please enter a message.';
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const mailtoLink = `mailto:contact@example.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[var(--text-main)]">Thank You!</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Click below to send your message via your email app:
        </p>
        <div className="pt-2">
          <a
            href={mailtoLink}
            className="btn-brand inline-block py-3 px-6 text-sm font-semibold rounded-[var(--radius-md)]"
          >
            Open Email Client
          </a>
        </div>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
          className="text-xs text-[var(--brand)] underline block mx-auto pt-3"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">Contact Us</h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Have feedback, questions, or DMCA inquiries? Send us a message.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-dev w-full px-4 py-2.5 text-sm rounded-[var(--radius-sm)]"
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
            Your Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-dev w-full px-4 py-2.5 text-sm rounded-[var(--radius-sm)]"
            placeholder="name@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-[var(--danger)]">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="input-dev w-full px-4 py-2.5 text-sm rounded-[var(--radius-sm)]"
            placeholder="Feedback / Inquiry / DMCA"
          />
          {errors.subject && <p className="mt-1 text-xs text-[var(--danger)]">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input-dev w-full px-4 py-2.5 text-sm rounded-[var(--radius-sm)] resize-none"
            placeholder="Write your message here..."
          />
          {errors.message && <p className="mt-1 text-xs text-[var(--danger)]">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="btn-brand w-full py-3 px-4 text-sm font-bold rounded-[var(--radius-sm)]"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
