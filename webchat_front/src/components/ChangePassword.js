import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    try {
      // TODO: 실제 비밀번호 찾기 로직 구현
      console.log('Finding password for:', formData);
      setSuccess('입력하신 이메일로 비밀번호 재설정 링크를 전송했습니다.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('계정을 찾을 수 없습니다. 입력 정보를 확인해주세요.');
    }
  };

  return (
    <div className="auth-container">
      <h2>비밀번호 변경</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="아이디를 입력하세요"
          />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="가입시 등록한 이메일을 입력하세요"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button type="submit">비밀번호 찾기</button>
      </form>
    </div>
  );
};

export default ChangePassword; 