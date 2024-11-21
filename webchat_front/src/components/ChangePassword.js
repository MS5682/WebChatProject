import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    if (!formData.email || !formData.userId) {
      setError('아이디와 이메일을 모두 입력해주세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('email', formData.email);
      params.append('userId', formData.userId);

      const response = await fetch('/email/change-password/send-email', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        if (errorMessage.includes('SendFailedException') || 
            errorMessage.includes('Invalid Addresses')) {
          throw new Error('존재하지 않는 이메일입니다.');
        }
        throw new Error(errorMessage);
      }

      setIsEmailSent(true);
      setTimer(300);
      setTimerActive(true);
      setError('');
    } catch (err) {
      setError(err.message);
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

      const response = await fetch('/email/change-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      setIsEmailVerified(true);
      setError('');
    } catch (err) {
      setError('잘못된 인증코드입니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('/user/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.newPassword
        })
      });

      if (!response.ok) {
        throw new Error('비밀번호 변경에 실패했습니다.');
      }

      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
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
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            placeholder="아이디를 입력하세요"
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
              placeholder="가입시 등록한 이메일을 입력하세요"
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
        
        {isEmailSent && (
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
                disabled={isEmailVerified}
              >
                {isEmailVerified ? '인증완료' : '인증하기'}
              </button>
            </div>
            {!isEmailVerified && timerActive && (
              <small className="timer-text">
                남은 시간: {formatTime(timer)}
              </small>
            )}
          </div>
        )}
        
        {isEmailVerified && (
          <>
            <div className="form-group">
              <label>새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
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
          </>
        )}
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <button 
          type="submit" 
          disabled={!isEmailVerified}
          className={!isEmailVerified ? 'disabled' : ''}
        >
          비밀번호 변경
        </button>
      </form>

      <div className="auth-links">
        <Link to="/login">로그인</Link>
        <span className="divider">|</span>
        <Link to="/find-id">아이디 찾기</Link>
        <span className="divider">|</span>
        <Link to="/register">회원가입</Link>
      </div>
    </div>
  );
};

export default ChangePassword; 