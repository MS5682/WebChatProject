import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import webChatLogo from '../assets/logo.png';

const Header = ({ isLoggedIn, userInfo, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
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
            <>
              <div className="user-info">
                <span>{userInfo.name}</span>
                <span>({userInfo.userId})</span>
                <span>{userInfo.email}</span>
              </div>
              <Link to="/friend-requests" className="friend-button">
                친구 관리
              </Link>
            </>
          )}
          {isLoggedIn ? (
            <button onClick={handleLogoutClick} className="auth-button">
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="auth-button">
              로그인
            </Link>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;