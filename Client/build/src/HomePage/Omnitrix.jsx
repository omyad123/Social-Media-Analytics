import React, { useState } from 'react';
import PageNavbar from './PageNavbar';
import Login from './Login';
import Register from './Register';

const Omnitrix = () => {
    // State to manage modal visibility
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // Function to toggle the modal
    const toggleLoginModal = () => {
        setShowLogin(!showLogin);
    };

    const toggleRegisterModal = () => {
        setShowRegister(!showRegister);
    };

    return (
        <div style={{ width: "100%" }}>
            <PageNavbar toggleLoginModal={toggleLoginModal} toggleRegisterModal={toggleRegisterModal} />
            <div>
                {/* Hero Section */}
                <div className={`container-fluid bg-primary text-white text-center py-5 ${showLogin ? 'blur-background' : ''}`}>
                    <h1 className="display-4">Welcome to Social Analytics</h1>
                    <p className="lead">Track your social media performance in real-time</p>
                    <button className="btn btn-light mt-3">Get Started</button>
                </div>

                {/* Analytics Preview */}
                <div className={`container my-5 ${showLogin ? 'blur-background' : ''}`}>
                    <h2 className="text-center mb-4">Overview</h2>
                    <div className="row text-center">
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">Total Reach</h5>
                                    <p className="card-text display-6">12.3K</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">Page Likes</h5>
                                    <p className="card-text display-6">1.2K</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">Engagement Rate</h5>
                                    <p className="card-text display-6">7.5%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Reminder */}
                <div className="container text-center my-4" style={{ color: "white" }}>
                    <h4 className="mb-3" style={{ color: "white" }}>To view your <span style={{ color: "yellow" }}>social media analytics</span></h4>
                    <p>You need to login to integrate your social media account first.</p>
                </div>
            </div>

            {/* Login Modal */}
            {showLogin && (
                <div className="login-modal">
                    <div className="modal-content">
                        <div className="inner">
                            <button
                                type="button"
                                onClick={toggleLoginModal}
                                className="btn btn-primary rounded-circle"
                                style={{ width: "45px", height: "45px", marginRight: "-300px"}}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="22px"
                                    viewBox="0 -960 960 960"
                                    width="22px"
                                    fill="white"
                                >
                                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                                </svg>
                            </button>
                            <Login />
                        </div>
                    </div>
                </div>
            )}
            {/* Register Modal */}
            {showRegister && (
                <div className="login-modal">
                    <div className="modal-content rg-model">
                        <div className="inner">
                        <button
                                type="button"
                                onClick={toggleRegisterModal}
                                className="btn btn-primary rounded-circle"
                                style={{ width: "45px", height: "45px", marginRight: "-382px",marginTop:"45px" }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="22px"
                                    viewBox="0 -960 960 960"
                                    width="22px"
                                    fill="white"
                                >
                                 <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                                </svg>
                            </button>
                            <Register />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Omnitrix;
