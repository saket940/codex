import { useEffect, useState } from 'react';
import { api } from '../api';
import InternshipCard from '../components/InternshipCard';

const createEmptyTask = () => ({
  title: '',
  mediaType: 'youtube',
  mediaUrl: '',
  questions: [
    {
      question: '',
      options: ['', '', '', ''],
      answer: ''
    }
  ]
});

export default function AdminPage() {
  const [summary, setSummary] = useState({ internships: [], users: [] });
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: '',
    duration: '',
    image: '',
    description: '',
    overview: '',
    tasks: [createEmptyTask()]
  });

  const refresh = () => api.getAdminSummary().then(setSummary).catch((error) => setMessage(error.message));

  useEffect(() => {
    refresh();
  }, []);

  const updateTask = (index, updater) => {
    const tasks = form.tasks.map((task, taskIndex) => (taskIndex === index ? updater(task) : task));
    setForm({ ...form, tasks });
  };

  const createInternship = async (event) => {
    event.preventDefault();
    try {
      await api.createInternship(form);
      setMessage('Internship created successfully.');
      setForm({
        title: '',
        category: '',
        duration: '',
        image: '',
        description: '',
        overview: '',
        tasks: [createEmptyTask()]
      });
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="admin-layout">
      <section className="card">
        <p className="eyebrow">Admin panel</p>
        <h1>Manage automated internships</h1>
        <p>Create internships with front-page cover images, daily video content, MCQs, and auto-graded progression rules.</p>
        <div className="stats-grid">
          <div><span>Total internships</span><strong>{summary.internships.length}</strong></div>
          <div><span>Registered users</span><strong>{summary.users.length}</strong></div>
          <div><span>Admin accounts</span><strong>{summary.users.filter((user) => user.role === 'admin').length}</strong></div>
        </div>
      </section>

      <section className="card">
        <h2>Create internship</h2>
        <form className="form-grid" onSubmit={createInternship}>
          <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></label>
          <label>Duration<input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} required /></label>
          <label>Image URL<input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required /></label>
          <label>Description<textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <label>Overview<textarea rows="4" value={form.overview} onChange={(event) => setForm({ ...form, overview: event.target.value })} required /></label>

          {form.tasks.map((task, index) => (
            <div className="nested-card" key={`task-${index}`}>
              <h3>Daily task {index + 1}</h3>
              <label>Task title<input value={task.title} onChange={(event) => updateTask(index, (current) => ({ ...current, title: event.target.value }))} required /></label>
              <label>
                Media type
                <select value={task.mediaType} onChange={(event) => updateTask(index, (current) => ({ ...current, mediaType: event.target.value }))}>
                  <option value="youtube">YouTube iframe</option>
                  <option value="video">Hosted MP4 video</option>
                </select>
              </label>
              <label>Media URL<input value={task.mediaUrl} onChange={(event) => updateTask(index, (current) => ({ ...current, mediaUrl: event.target.value }))} required /></label>
              {task.questions.map((question, questionIndex) => (
                <div className="question-box" key={`question-${questionIndex}`}>
                  <label>Question<input value={question.question} onChange={(event) => updateTask(index, (current) => ({
                    ...current,
                    questions: current.questions.map((item, itemIndex) => itemIndex === questionIndex ? { ...item, question: event.target.value } : item)
                  }))} required /></label>
                  {question.options.map((option, optionIndex) => (
                    <label key={`option-${optionIndex}`}>
                      Option {optionIndex + 1}
                      <input value={option} onChange={(event) => updateTask(index, (current) => ({
                        ...current,
                        questions: current.questions.map((item, itemIndex) => itemIndex === questionIndex ? {
                          ...item,
                          options: item.options.map((entry, entryIndex) => entryIndex === optionIndex ? event.target.value : entry)
                        } : item)
                      }))} required />
                    </label>
                  ))}
                  <label>Correct answer<input value={question.answer} onChange={(event) => updateTask(index, (current) => ({
                    ...current,
                    questions: current.questions.map((item, itemIndex) => itemIndex === questionIndex ? { ...item, answer: event.target.value } : item)
                  }))} required /></label>
                </div>
              ))}
            </div>
          ))}
          <div className="button-row">
            <button type="button" className="secondary-btn" onClick={() => setForm({ ...form, tasks: [...form.tasks, createEmptyTask()] })}>Add another day</button>
            <button className="primary-btn" type="submit">Publish internship</button>
          </div>
          {message && <p className="status-message success">{message}</p>}
        </form>
      </section>

      <section className="section-gap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Published internships</p>
            <h2>Visible on the front page</h2>
          </div>
        </div>
        <div className="card-grid">
          {summary.internships.map((internship) => <InternshipCard key={internship.id} internship={internship} />)}
        </div>
      </section>
    </main>
  );
}
