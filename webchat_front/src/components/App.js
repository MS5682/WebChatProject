import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import ChatRoom from './ChatRoom';
import Login from './Login';
import Register from './Register';
import FindId from './FindId';
import ChangePassword from './ChangePassword';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import '../styles/App.css';
import { Client } from '@stomp/stompjs';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    userId: '',
    email: '',
    userIdx: ''
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const clientRef = useRef(null);

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

  const toggleFriendsList = () => {
    setIsFriendsListOpen(!isFriendsListOpen);
  };

  const connectWebSocket = useCallback((userIdx) => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected!');
        setIsOnline(true);
        
        // 온라인 상태 알림
        client.publish({
          destination: '/app/user.status',
          body: JSON.stringify({
            userIdx: userIdx,
            status: 'ONLINE'
          })
        });

        // 유저 상태 변경 구독
        client.subscribe('/topic/user.status', (message) => {
          try {
            const statusUpdate = JSON.parse(message.body);
            // FriendsList 컴포넌트에 상태 업데이트를 전달하기 위한 이벤트 발생
            const event = new CustomEvent('userStatusUpdate', {
              detail: statusUpdate
            });
            window.dispatchEvent(event);
          } catch (error) {
            console.error('상태 업데이트 처리 중 오류:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected!');
        setIsOnline(false);
      }
    });

    try {
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Connection error:', error);
      setIsOnline(false);
    }
  }, []);

  // 로그인 상태 변경 감지
  useEffect(() => {
    if (isLoggedIn && userInfo.userIdx) {
      connectWebSocket(userInfo.userIdx);
    }

    return () => {
      if (clientRef.current) {
        // 오프라인 상태 알림 후 연결 종료
        if (isLoggedIn && userInfo.userIdx) {
          clientRef.current.publish({
            destination: '/app/user.status',
            body: JSON.stringify({
              userIdx: userInfo.userIdx,
              status: 'OFFLINE'
            })
          });
        }
        clientRef.current.deactivate();
      }
    };
  }, [isLoggedIn, userInfo, connectWebSocket]);

  // 페이지 종료 시 오프라인 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoggedIn && userInfo.userIdx && clientRef.current) {
        clientRef.current.publish({
          destination: '/app/user.status',
          body: JSON.stringify({
            userIdx: userInfo.userIdx,
            status: 'OFFLINE'
          })
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoggedIn, userInfo]);

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
            <Route path="/" element={
              <Home 
                isLoggedIn={isLoggedIn} 
                userInfo={userInfo}
              />
            } />
            <Route path="/chat/:roomId" element={
              <ChatRoom userInfo={userInfo} />
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/friend-requests" element={<FriendRequests />} />
          </Routes>
        </div>
        {isLoggedIn && (
          <>
            <button 
              className={`friends-toggle-btn ${isFriendsListOpen ? 'open' : ''}`}
              onClick={toggleFriendsList}
            >
              {isFriendsListOpen ? '✕' : '👥 친구 목록'}
            </button>
            <div className={`friends-sidebar ${isFriendsListOpen ? 'open' : ''}`}>
              <FriendsList />
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
