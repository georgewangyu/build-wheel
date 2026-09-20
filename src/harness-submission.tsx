import { useState, type FormEvent } from 'react';
import { parseHarnessSubmission } from './harness-submission-schema.ts';

export function HarnessSubmissionForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const input = parseHarnessSubmission(values);
    if (!input) { setStatus('error'); setMessage('Add a project name, a GitHub repository link, and a short description (at least 15 characters).'); return; }
    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/api/submit-harness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Submission failed.');
      form.reset();
      setStatus('sent');
      setMessage('Sent for review. Thanks for putting this harness on our radar.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not send your project right now.');
    }
  }

  return <section className="harness-submit" id="submit-harness" aria-labelledby="submit-harness-title">
    <div className="submit-intro"><p className="board-kicker">02 / YOUR TURN</p><h2 id="submit-harness-title">Missing a harness<span>?</span></h2><p>Send us a public GitHub repo and why it belongs in the field. Submissions go to a private review queue; being listed is not automatic.</p></div>
    <form onSubmit={submit} noValidate>
      <div className="submit-fields"><label>Project name<input name="name" required minLength={2} maxLength={100} placeholder="e.g. My agent harness" /></label><label>GitHub repository<input name="repository" required type="url" placeholder="https://github.com/owner/repo" /></label></div>
      <label>What does it do?<textarea name="reason" required minLength={15} maxLength={1200} rows={3} placeholder="A short description and why people should check it out…" /></label>
      <label>Credit or contact <span>(optional)</span><input name="handle" maxLength={120} placeholder="Name, handle, or email" /></label>
      <div className="submit-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="submit-bottom"><button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Submit a harness ↗'}</button><p role="status" aria-live="polite" className={status === 'error' ? 'is-error' : undefined}>{message || 'No image needed—just the repo link and your pitch.'}</p></div>
    </form>
  </section>;
}
