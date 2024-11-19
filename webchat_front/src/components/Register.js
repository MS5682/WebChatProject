import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    // TODO: 회원가입 로직 구현
    console.log('Register attempt:', { username, password });
    navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
  };

  return (
    <div className="register-container">
      <h2>회원가입</h2>
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
        <div className="form-group">
          <label>비밀번호 확인:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default Register; 