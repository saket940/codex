import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import TaskPlayer from '../components/TaskPlayer';

export default function DashboardPage({ session }) {
  const [dashboard, setDashboard] = useState(null);
  const [answers, setAnswers] = useState({});
  const [workLink, setWorkLink] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getDashboard(session.id).then(setDashboard).catch((error) => setMessage(error.message));
  }, [session.id]);

  const completionRate = useMemo(() => {
    if (!dashboard?.internship) return 0;
    return Math.round((dashboard.progress.completedDays.length / dashboard.internship.tasks.length) * 100);
  }, [dashboard]);

  const submitTask = async (event) => {
    event.preventDefault();
    try {
      const result = await api.submitTask(session.id, dashboard.currentTask.day, { answers, workLink, notes });
      setMessage(result.message);
      setAnswers({});
      setWorkLink('');
      setNotes('');
      const refreshed = await api.getDashboard(session.id);
      setDashboard(refreshed);
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!dashboard) {
    return <main className="page-center"><div className="card">Loading dashboard...</div></main>;
  }

  const { internship, currentTask, progress, user } = dashboard;

  return (
    <main className="dashboard-layout">
      <section className="card summary-card">
        <p className="eyebrow">Intern dashboard</p>
        <h1>{internship.title}</h1>
        <p>{internship.overview}</p>
        <div className="progress-wrap">
          <div className="progress-bar"><span style={{ width: `${completionRate}%` }} /></div>
          <strong>{completionRate}% complete</strong>
        </div>
        <div className="stats-grid">
          <div><span>Unlocked day</span><strong>Day {progress.unlockedDay}</strong></div>
          <div><span>Completed</span><strong>{progress.completedDays.length} / {internship.tasks.length}</strong></div>
          <div><span>Certificates</span><strong>{user.certificates.length}</strong></div>
        </div>
        {user.certificates[0] && (
          <div className="certificate-box">
            <h3>Certificate issued</h3>
            <p>{user.certificates[0].certificateId}</p>
            <p>{new Date(user.certificates[0].issuedAt).toLocaleString()}</p>
          </div>
        )}
      </section>

      <section className="card task-card">
        <p className="eyebrow">Today's unlocked task</p>
        {currentTask ? (
          <>
            <h2>Day {currentTask.day}: {currentTask.title}</h2>
            <TaskPlayer task={currentTask} />
            <form className="form-grid" onSubmit={submitTask}>
              {currentTask.questions.map((question) => (
                <label key={question.id}>
                  {question.question}
                  <select
                    required
                    value={answers[question.id] || ''}
                    onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}
                  >
                    <option value="">Choose answer</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
              <label>
                Work submission link
                <input value={workLink} onChange={(event) => setWorkLink(event.target.value)} placeholder="Drive / GitHub / Portfolio link" required />
              </label>
              <label>
                Submission notes
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="What did you complete today?" />
              </label>
              {message && <p className={`status-message ${message.includes('Congratulations') ? 'success' : 'error'}`}>{message}</p>}
              <button className="primary-btn" type="submit">Submit day {currentTask.day}</button>
            </form>
          </>
        ) : (
          <div>
            <h2>All tasks complete</h2>
            <p>Your certificate has been generated automatically. Great job!</p>
          </div>
        )}
      </section>
    </main>
  );
}
