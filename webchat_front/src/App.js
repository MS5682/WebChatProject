import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';
import Register from './components/Register';
import FindId from './components/FindId';
import ChangePassword from './components/ChangePassword';
import FriendsList from './components/FriendsList';
import FriendRequests from './components/FriendRequests';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    userId: '',
    email: '',
    userIdx: ''
  });
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const currentToken = localStorage.getItem('token');

      if (!currentToken) {
        throw new Error('토큰이 없습니다.');
      }

      const response = await fetch('/user/check-auth', {
        headers: {
          'Authorization': currentToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || '인증 실패');
        } catch (e) {
          throw new Error('인증 처리 중 오류가 발생했습니다.');
        }
      }

      const responseData = await response.json();
      
      setUserInfo({
        name: responseData.name,
        userId: responseData.userId,
        email: responseData.email,
        userIdx: responseData.userIdx
      });
      setIsLoggedIn(true);
      
    } catch (error) {
      console.error('인증 체크 에러:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
    setUserInfo({
      name: '',
      userId: '',
      email: '',
      userIdx: ''
    });
  };

  return (
    <div className="app">
      <Header 
        isLoggedIn={isLoggedIn} 
        userInfo={userInfo}
        onLogout={handleLogout}
      />
      <div className="main-container">
        <div className="content">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/friend-requests" element={<FriendRequests />} />
          </Routes>
        </div>
        <div className="right-sidebar">
          {isLoggedIn && <FriendsList />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
