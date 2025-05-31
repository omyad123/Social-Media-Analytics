import React from 'react';

const ContentPerformance = ({ posts }) => {
  console.log("posts-----", posts);
  const noData = !Array.isArray(posts) || posts.length === 0;

  return (
    <div className="container mt-4">
      <h5 className="mb-4" style={{color:"grey"}}>Top Performing Posts</h5>

      <div className="table-responsive rounded" style={{border:"1.5px solid grey"}}>
        {noData ? (
          <div className="alert alert-info text-center m-3" role="alert">
            No posts available in the selected date range.
          </div>
        ) : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Post</th>
                <th scope="col">Impressions</th>
                <th scope="col">Clicks</th>
                <th scope="col">Reactions</th>
                <th scope="col">Video Views</th>
                <th scope="col">Avg Watch Time</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.postId}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={post.mediaUrl || 'https://via.placeholder.com/60?text=No+Image'}
                        alt="Post media"
                        className="rounded"
                        width="60"
                        height="60"
                        style={{ objectFit: 'cover', border: '1px solid #ddd' }}
                      />
                      <a
                        href={post.permalinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-decoration-none fw-semibold"
                        style={{ transition: 'color 0.2s' }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#0a58ca')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#0d6efd')}
                      >
                        View Post
                      </a>
                    </div>
                  </td>
                  <td>{post.metrics?.impressions?.toLocaleString() || '—'}</td>
                  <td>{post.metrics?.totalClicks?.toLocaleString() || '—'}</td>
                  <td>
                    {post.metrics?.reactionsCount
                      ? Object.entries(post.metrics.reactionsCount).map(
                          ([type, count], idx, arr) => (
                            <span key={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                              {idx < arr.length - 1 ? ', ' : ''}
                            </span>
                          )
                        )
                      : '—'}
                  </td>
                  <td>{post.metrics?.videoViews ?? '—'}</td>
                  <td>{post.metrics?.averageWatchTime ?? '—'}s</td>
                  <td>
                    {post.postTimestamp
                      ? new Date(post.postTimestamp).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ContentPerformance;
