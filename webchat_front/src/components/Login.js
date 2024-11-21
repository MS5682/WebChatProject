import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';
import { useUser } from '../contexts/UserContext';

const Login = () => {
  const { setIsLoggedIn, setUserIdx } = useUser();
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
    setError('');
    
    try {
      const response = await fetch('/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setUserIdx(data.userIdx);
        navigate('/');
      } else {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다. 다시 시도해주세요.');
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