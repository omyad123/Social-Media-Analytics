import React from 'react';

function PostList({ posts }) {
  return (
    <>
      <h5 className="text-md  mb-4 mx-4 mt-4" style={{color:"grey"}}>
        Top Post 
      </h5>
    <div className="post-list" style={{border:"1px solid grey",boxShadow:"0 0px 10px #001027",borderRadius:"8px"}}>
<h5
  className="text-center mb-4"
  style={{
   border:"1px solid grey",boxShadow:"0 0px 10px #001027",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    color: "grey",
  }}
>
  List of valuable Posts
</h5>
      {posts.length === 0 ? (
  <p style={{ textAlign: "center", }}>
  No posts available for that filter.
</p>

      ) : (
        
        <div className="post-grid">
          <div className="post-header">
            <span>Post Type</span>
            <span>Timestamp</span>
            <span>Likes</span>
            <span>Reach</span>
            <span>Comments</span>
            <span>Impressions</span>
            <span>Saved</span>
            <span>View Post</span>
          </div>
          {posts.map((post) => (
            <div key={post.post_id} className="post-row">
              <span className='text-center'>{post.type}</span>
              <span className='text-center'>{new Date(post.post_timestamp).toLocaleString()}</span>
              <span className='text-center'>{post.metrics.likes}</span>
              <span className='text-center'>{post.metrics.reach}</span>
              <span className='text-center'>{post.metrics.comments}</span>
              <span className='text-center'>{post.metrics.impressions || 'N/A'}</span>
              <span className='text-center'>{post.metrics.saved || 'N/A'}</span>
              <span className='text-center'>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    // Check if the permalink URL is valid
                    if (!post.permalink) {
                      alert("This post is unavailable.");
                      e.preventDefault();
                    }
                  }}
                >
                  {post.permalink ? "View Post" : "Post Unavailable"}
                </a>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default PostList;
