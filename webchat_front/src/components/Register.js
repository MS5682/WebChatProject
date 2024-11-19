import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: ''
  });
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendVerification = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      // TODO: 실제 이메일 인증코드 발송 API 호출
      console.log('Sending verification code to:', formData.email);
      setIsEmailSent(true);
      setError('');
    } catch (err) {
      setError('인증코드 발송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!formData.verificationCode) {
      setError('인증코드를 입력해주세요.');
      return;
    }

    try {
      // TODO: 실제 인증코드 확인 API 호출
      console.log('Verifying code:', formData.verificationCode);
      setIsEmailVerified(true);
      setError('');
    } catch (err) {
      setError('잘못된 인증코드입니다. 다시 확인해주세요.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEmailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // TODO: 실제 회원가입 로직 구현
      console.log('Register attempt:', { username: formData.username, password: formData.password });
      navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="register-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
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
        <div className="form-group">
          <label>비밀번호 확인:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>이메일:</label>
          <div className="input-button-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              onClick={handleSendVerification}
              disabled={isEmailSent}
            >
              {isEmailSent ? '발송됨' : '인증코드 발송'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>인증코드:</label>
          <div className="input-button-group">
            <input
              type="text"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              onClick={handleVerifyCode}
              disabled={isEmailVerified}
            >
              {isEmailVerified ? '인증완료' : '인증하기'}
            </button>
          </div>
        </div>
        <button type="submit">회원가입</button>
      </form>
      <p className="auth-link">
        이미 계정이 있으신가요? <a href="/login">로그인</a>
      </p>
    </div>
  );
};

export default Register; 