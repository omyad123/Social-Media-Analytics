import React, { useState } from 'react';
import axios from 'axios';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/user/register', formData);
      
      if (response.status === 201 || response.status === 200) {
        setMessage('Registered successfully!');
        setFormData({ name: '', email: '', password: '' });
      } else {
        setMessage(` Unexpected response`);
      }
    } catch (error) {
      if (error.response) {
        setMessage(` ${error.response.data.message || 'Registration failed'}`);
      } else {

        setMessage(' Network error. Please try again.');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ marginTop: '0px' }}>
      <div className="card p-4 shadow" style={{ maxWidth: '450px', width: '100%' }}>
        <h3 className="text-center mb-3 text-primary">Create an Account</h3>

        {message && (
          <div className={`alert ${message.includes('Registered') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-success w-100">Register</button>
        </form>

        <p className="mt-3 text-center">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
