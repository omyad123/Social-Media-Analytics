import React from "react";
import DateFilter from "./DateFilter";


const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark  border-bottom px-4 py-3  d-flex justify-content-between align-items-center sticky-top" style={{ background: "#131f35",color:"white" }}>
      <div className="d-flex flex-wrap gap-3">
        {[
          "PAGE OVERVIEW",
          "DEMOGRAPHICS",
          "BRAND AWARENESS",
          "TOP POSTS",
          "REPORTS",
        ].map((item, index) => (
          <button
            key={index}
            className="btn btn-link text-light text-uppercase fw-medium px-2 py-1"
            style={{ textDecoration: "none", fontSize: "14px" }}
          >
            {item}
          </button>
        ))}
      </div>

    </nav>
  );
};

export default Navbar;
