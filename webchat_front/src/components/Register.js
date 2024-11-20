import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: ''
  });
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsEmailSent(false);
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
      const params = new URLSearchParams();
      params.append('email', formData.email);

      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      setIsEmailSent(true);
      setTimer(300);
      setTimerActive(true);
      setError('');
    } catch (err) {
      setError(err.message || '인증코드 발송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!formData.verificationCode) {
      setError('인증코드를 입력해주세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('email', formData.email);
      params.append('code', formData.verificationCode);

      const response = await fetch('/api/email/verify', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      setIsEmailVerified(true);
      setError('');
    } catch (err) {
      setError(err.message || '잘못된 인증코드입니다. 다시 확인해주세요.');
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
      console.log('Register attempt:', { 
        user_id: formData.user_id, 
        name: formData.name,
        email: formData.email,
        password: formData.password 
      });
      navigate('/login');
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="register-container">
      <h2>회원가입</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
        <div className="form-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>이메일</label>
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
              disabled={isEmailSent && timerActive}
            >
              {isEmailSent ? `재발송 ${formatTime(timer)}` : '인증코드 발송'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>인증코드</label>
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
              disabled={isEmailVerified || !isEmailSent}
            >
              {isEmailVerified ? '인증완료' : '인증하기'}
            </button>
          </div>
          {isEmailSent && !isEmailVerified && (
            <small className="timer-text">
              남은 시간: {formatTime(timer)}
            </small>
          )}
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