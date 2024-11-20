import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import webChatLogo from '../assets/logo.png';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('userSession');
    navigate('/');
  };

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
          {isLoggedIn && (
            <Link to="/friend-requests" className="friend-button">
              친구 관리
            </Link>
          )}
          <Link 
            to={isLoggedIn ? "/" : "/login"} 
            className="auth-button"
            onClick={isLoggedIn ? handleLogout : undefined}
          >
            {isLoggedIn ? "로그아웃" : "로그인"}
          </Link>
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