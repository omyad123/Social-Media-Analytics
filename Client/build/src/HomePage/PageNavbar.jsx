import React from 'react';
import { Link } from 'react-router-dom';

const PageNavbar = ({ toggleLoginModal,toggleRegisterModal }) => {
  return (
    <div style={{ width: "100%" }}>
      <nav className="navbar navbar-expand-lg bg-body-tertiary" style={{ width: "100%" }}>
        <div className="container-fluid">
          <img src="./public/img/logo.png" style={{height:"30px"}} alt="logo" /> &nbsp; 
          <a className="navbar-brand" href="#">Omnidash</a> &nbsp;&nbsp; &nbsp;
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <form className="d-flex me-auto" role="search">
              <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
              <button className="btn btn-outline-success" type="submit">Search</button>
            </form>
            <div className="d-flex">
              <button onClick={toggleLoginModal} className="btn btn-outline-primary me-2">Login</button>
              <button className="btn btn-primary" onClick={toggleRegisterModal}>Register</button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default PageNavbar;
