import React, { useEffect, useState } from "react";
import api from "../api";

const InstaProfile = ({ onPageSelect }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInstaProfiles = async () => {
      try {
        const res = await api.get("/api/insight/ig/insta_Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dataArray = res.data.data || [];
        setAccounts(dataArray);

        if (!selectedId && dataArray.length > 0) {
          const defaultId = dataArray[0].instagram_user_id;
          setSelectedId(defaultId);
          if (onPageSelect) onPageSelect(defaultId);
        }
      } catch (err) {
        console.error("Error fetching Instagram profiles:", err);
      }
    };

    fetchInstaProfiles();
  }, []);

  if (accounts.length === 0) return null;

  const selectedData = accounts.find((acc) => acc.instagram_user_id === selectedId);

  return (
    <>
      <div>
        <label htmlFor="insta-select" style={{ marginRight: "8px", fontWeight: "600" }}>
          Select Instagram Profile:
        </label>
        <select
          id="insta-select"
          value={selectedId || ""}
          onChange={(e) => {
            const newId = e.target.value;
            setSelectedId(newId);
            if (onPageSelect) onPageSelect(newId);
          }}
          style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          {accounts.map((acc) => (
            <option key={acc.instagram_user_id} value={acc.instagram_user_id}>
              {acc.ig_username}
            </option>
          ))}
        </select>
      </div>

      {selectedData && (
        <div
          className="fb-profile-wrapper mt-2"
          style={{ position: "relative", display: "inline-block", marginRight: "50px" }}
        >
          <div className="fb-tooltip">User ID: {selectedData.instagram_user_id}</div>

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
                src={selectedData.ig_profile_url}
                alt="Instagram Profile"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                alt="Instagram"
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
              <div style={{ fontWeight: "600", fontSize: "14px" }}>{selectedData.ig_username}</div>
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
          z-index: 9999;
        }
      `}</style>
    </>
  );
};

export default InstaProfile;
