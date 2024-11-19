import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import webChatLogo from '../assets/logo.png';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const toggleSession = () => {
    setIsLoggedIn(!isLoggedIn);
    if (!isLoggedIn) {
      localStorage.setItem('userSession', 'dummy-session');
    } else {
      localStorage.removeItem('userSession');
    }
  };

  return (
    <>
      <div className="banner">
        <p>🎉 웹 챗 서비스에 오신 것을 환영합니다!</p>
      </div>
      <header className="header">
        <div className="logo">
          <Link to="/">
            <img src={webChatLogo} alt="WebChat" className="logo-image" />
          </Link>
        </div>
        <nav className="auth-nav">
          <Link to="/login" className="auth-button">로그인</Link>
          <Link to="/register" className="auth-button">회원가입</Link>
          <button 
            onClick={toggleSession} 
            className="session-button"
            style={{
              backgroundColor: isLoggedIn ? '#4CAF50' : '#f44336'
            }}
          >
            세션 {isLoggedIn ? '있음' : '없음'}
          </button>
        </nav>
      </header>
    </>
  );
};

export default Header;