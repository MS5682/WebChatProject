import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password
        })
      });

      if (response.ok) {
        const token = response.headers.get('Authorization');
        console.log('받은 토큰:', token);
        
        if (token) {
          localStorage.setItem('token', token);
          navigate('/');
          window.location.reload();
        } else {
          throw new Error('토큰이 없습니다.');
        }
      } else {
        throw new Error('로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">로그인</button>
      </form>
      
      <div className="auth-links">
        <Link to="/find-id">아이디 찾기</Link>
        <span className="divider">|</span>
        <Link to="/change-password">비밀번호 변경</Link>
        <span className="divider">|</span>
        <Link to="/register">회원가입</Link>
      </div>
    </div>
  );
};

export default Login; 