import { useState, type FormEvent } from 'react';
import { parseHarnessSubmission } from './harness-submission-schema.ts';
import { harnessIssueUrl } from './harness-submission-url.ts';

export function HarnessSubmissionForm() {
  const [status, setStatus] = useState<'idle' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const input = parseHarnessSubmission(values);
    if (!input) { setStatus('error'); setMessage('Add a project name, a GitHub repository link, and a description of at least 15 characters. Keep it concise enough to fit GitHub’s issue link.'); return; }
    window.location.assign(harnessIssueUrl(input));
  }

  return <section className="harness-submit" id="submit-harness" aria-labelledby="submit-harness-title">
    <div className="submit-intro"><p className="board-kicker">02 / YOUR TURN</p><h2 id="submit-harness-title">Missing a harness<span>?</span></h2><p>Tell us about a public GitHub repo. We’ll open a prefilled issue in Jarvis AI George for you to review and post; being listed is not automatic.</p></div>
    <form onSubmit={submit} noValidate>
      <div className="submit-fields"><label>Project name<input name="name" required minLength={2} maxLength={100} placeholder="e.g. My agent harness" /></label><label>GitHub repository<input name="repository" required type="url" placeholder="https://github.com/owner/repo" /></label></div>
      <label>What does it do?<textarea name="reason" required minLength={15} maxLength={1200} rows={3} placeholder="A short description and why people should check it out…" /></label>
      <label>Public credit <span>(optional)</span><input name="handle" maxLength={120} placeholder="Your name or GitHub handle (public)" /></label>
      <div className="submit-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="submit-bottom"><button type="submit">Continue on GitHub ↗</button><p role="status" aria-live="polite" className={status === 'error' ? 'is-error' : undefined}>{message || 'A GitHub account is required. Your issue and any credit you include will be public; it is not posted until you confirm on GitHub.'}</p></div>
    </form>
  </section>;
}
