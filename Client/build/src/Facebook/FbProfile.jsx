import React, { useEffect, useState } from "react";
import api from "../api";

const FbProfile = ({ onPageSelect }) => {
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFbProfile = async () => {
      try {
        const res = await api.get("/api/insight/fb_profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const pagesData = res.data.data || [];
        setPages(pagesData);

        // Only set default selected page if not already selected
        if (!selectedPageId && pagesData.length > 0) {
          const defaultPageId = pagesData[0].page_Id;
          setSelectedPageId(defaultPageId);
          if (onPageSelect) {
            onPageSelect(defaultPageId);
          }
        }
      } catch (err) {
        console.error("Error fetching FB profile:", err);
      }
    };

    fetchFbProfile();
  }, []); 

  if (pages.length === 0) return null;

  const fbData = pages.find((p) => p.page_Id === selectedPageId);

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <label htmlFor="page-select" style={{ marginRight: "8px", fontWeight: "600" }}>
          Select Facebook Page:
        </label>
        <select
          id="page-select"
          value={selectedPageId || ""}
          onChange={(e) => {
            const newPageId = e.target.value;
            setSelectedPageId(newPageId);
            if (onPageSelect) {
              onPageSelect(newPageId);
            }
          }}
          style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          {pages.map((page) => (
            <option key={page.page_Id} value={page.page_Id}>
              {page.page_name}
            </option>
          ))}
        </select>
      </div>

      {fbData && (
        <div
          className="fb-profile-wrapper mt-2"
          style={{ position: "relative", display: "inline-block", marginRight: "50px" }}
        >
          <div className="fb-tooltip">Page ID: {fbData.page_Id}</div>

          <div
            className="d-flex align-items-center shadow-sm p-2 rounded fb-profile-card"
            style={{
              backgroundColor: "#fff",
              maxWidth: "260px",
              background: "transparent",
              cursor: "default",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={fbData.Fb_profile_url}
                alt="FB Page"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook"
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "white",
                  padding: "1px",
                }}
              />
            </div>

            <div className="ms-2">
              <div style={{ fontWeight: "600", fontSize: "14px" }}>{fbData.page_name}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fb-tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #15243E;
          color: #fff;
          padding: 6px 12px;
          font-size: 13px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: opacity 0.3s ease, transform 0.3s ease;
          z-index: 10;
          border: 1px solid grey;
        }

        .fb-profile-wrapper:hover .fb-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-5px);
          z-index: 88888888888888888;
        }
      `}</style>
    </>
  );
};

export default FbProfile;
