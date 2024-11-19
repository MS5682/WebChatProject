import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: 로그인 로직 구현
    console.log('Login attempt:', { username, password });
    navigate('/'); // 로그인 성공 시 홈으로 이동
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login; 