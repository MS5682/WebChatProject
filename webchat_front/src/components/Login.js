import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    user_id: '',
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
      // TODO: 실제 로그인 로직 구현
      console.log('Login attempt:', { 
        user_id: formData.user_id, 
        password: formData.password 
      });
      navigate('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디:</label>
          <input
            type="text"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호:</label>
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
        <Link to="/find-password">비밀번호 찾기</Link>
        <span className="divider">|</span>
        <Link to="/register">회원가입</Link>
      </div>
    </div>
  );
};

export default Login; 