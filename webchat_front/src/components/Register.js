import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    userId: '',
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
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState('');
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
    if (name === 'userId') {
      setIsIdChecked(false);
    }
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

      const response = await fetch('/email/send-verification', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'same-origin'
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

      const response = await fetch('/email/verify', {
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

  const handleCheckId = async (e) => {
    e.preventDefault();
    if (!formData.userId) {
      setError('아이디를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`/user/check/${formData.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('서버 오류가 발생했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setIsIdChecked(true);
        setIdCheckMessage(data.message);
        setIdCheckStatus('success');
        setError('');
      } else {
        setIsIdChecked(false);
        setIdCheckMessage(data.message);
        setIdCheckStatus('error');
      }
    } catch (err) {
      setIsIdChecked(false);
      setIdCheckMessage('아이디 중복 확인에 실패했습니다.');
      setIdCheckStatus('error');
      console.error('에러 발생:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isIdChecked) {
      setError('아이디 중복 확인이 필요합니다.');
      return;
    }

    if (!isEmailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      // 회원가입 성공
      alert('회원가입이 완료되었습니다.');
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
          <div className="input-button-group">
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            />
            <button 
              type="button"
              onClick={handleCheckId}
              className={isIdChecked ? 'checked' : ''}
            >
              {isIdChecked ? '확인완료' : '중복확인'}
            </button>
          </div>
          {idCheckMessage && (
            <small className={`id-check-message ${idCheckStatus}`}>
              {idCheckMessage}
            </small>
          )}
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
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
};

export default Register; 