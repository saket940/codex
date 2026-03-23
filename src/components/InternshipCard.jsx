export default function InternshipCard({ internship }) {
  return (
    <article className="card internship-card">
      <img src={internship.image} alt={internship.title} className="card-image" />
      <div className="card-content">
        <p className="eyebrow">{internship.category}</p>
        <h3>{internship.title}</h3>
        <p>{internship.description}</p>
        <div className="meta-row">
          <span>{internship.duration}</span>
          <span>{internship.tasks.length} daily tasks</span>
        </div>
      </div>
    </article>
  );
}
