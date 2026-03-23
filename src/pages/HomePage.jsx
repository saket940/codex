import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import InternshipCard from '../components/InternshipCard';

export default function HomePage() {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    api.getInternships().then(setInternships).catch(console.error);
  }, []);

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Automated internship platform</p>
          <h1>Launch, learn, submit, and certify with zero manual coordination.</h1>
          <p className="hero-copy">
            InternHub lets applicants choose an internship during sign-up, unlocks exactly one task per day,
            delivers a training video, checks multiple-choice answers, and issues certificates automatically after completion.
          </p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/register">Start your internship</Link>
            <Link className="secondary-btn" to="/login">Login</Link>
          </div>
        </div>
        <div className="feature-card">
          <h2>How it works</h2>
          <ul>
            <li>Applicants must select an internship program while creating an account.</li>
            <li>Admins publish internships, cover images, videos, and quiz questions from one panel.</li>
            <li>Only one day unlocks at a time, and correct answers are required to continue.</li>
            <li>Certificates are generated automatically when every daily task is complete.</li>
          </ul>
        </div>
      </section>

      <section className="section-gap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Open programs</p>
            <h2>Choose your internship path</h2>
          </div>
          <p>Every internship below is visible on the front page with admin-managed media and structure.</p>
        </div>
        <div className="card-grid">
          {internships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      </section>
    </main>
  );
}
