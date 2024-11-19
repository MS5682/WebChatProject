import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const FindId = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // TODO: 실제 아이디 찾기 로직 구현
      console.log('Finding ID for email:', email);
      setSuccess('입력하신 이메일로 아이디를 전송했습니다.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('아이디를 찾을 수 없습니다. 이메일을 확인해주세요.');
    }
  };

  return (
    <div className="auth-container">
      <h2>아이디 찾기</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이메일:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="가입시 등록한 이메일을 입력하세요"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button type="submit">아이디 찾기</button>
      </form>
    </div>
  );
};

export default FindId; 