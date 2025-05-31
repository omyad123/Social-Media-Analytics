import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


 const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/api/user/login', {
        email,
        password
      });

      if (res.data.success) {
        // Save token in localStorage
        localStorage.setItem("token", res.data.token);

        alert("Login successful!");
        navigate("/LayoutPage");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (error) {
      alert("Something went wrong!");
      console.error(error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-20">
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-3 text-primary">Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" placeholder="Enter email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="Password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
