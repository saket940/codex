export default function TaskPlayer({ task }) {
  if (!task) {
    return <div className="card">No task unlocked yet.</div>;
  }

  const isYouTube = task.mediaType === 'youtube';

  return (
    <div className="task-player">
      {isYouTube ? (
        <iframe
          src={task.mediaUrl}
          title={task.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video controls src={task.mediaUrl} className="video-player">
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}
