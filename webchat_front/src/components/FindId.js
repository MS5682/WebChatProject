import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const FindId = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [foundId, setFoundId] = useState('');
  const navigate = useNavigate();

  // 타이머 효과
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

  const handleSendVerification = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('email', email);

      const response = await fetch('/email/find-id/send-email', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        // 이메일 발송 실패 에러 메시지 확인
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
    if (!verificationCode) {
      setError('인증코드를 입력해주세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('code', verificationCode);

      const response = await fetch("/email/find-id/verify", {
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

      const userId = await response.text();
      setFoundId(userId);
      setIsEmailVerified(true);
      setError('');
    } catch (err) {
      setError('잘못된 인증코드입니다.');
    }
  };

  const handleFindId = (e) => {
    e.preventDefault();
    if (foundId) {
      setSuccess(`찾은 아이디: ${foundId}`);
    }
  };

  return (
    <div className="auth-container">
      <h2>아이디 찾기</h2>
      <form onSubmit={handleFindId}>
        <div className="form-group">
          <label>이메일</label>
          <div className="input-button-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
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
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <button 
          type="submit" 
          disabled={!isEmailVerified}
          className={!isEmailVerified ? 'disabled' : ''}
        >
          아이디 찾기
        </button>
      </form>

      <div className="auth-links">
        <Link to="/login">로그인</Link>
        <span className="divider">|</span>
        <Link to="/change-password">비밀번호 변경</Link>
        <span className="divider">|</span>
        <Link to="/register">회원가입</Link> 
      </div>
    </div>
  );
};

export default FindId; 