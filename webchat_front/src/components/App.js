import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import ChatRoom from './ChatRoom';
import Login from './Login';
import Register from './Register';
import FindId from './FindId';
import ChangePassword from './ChangePassword';
import FriendRequests from './FriendRequests';
import '../styles/App.css';
import { Client } from '@stomp/stompjs';

// fetchWithToken 함수 추가
export const fetchWithToken = async (url, options = {}) => {
  if (url.startsWith('/user/') || url.startsWith('/email/')) {
    return fetch(url, options);
  }

  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// ProtectedRoute 컴포넌트 추가
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // 토큰이 없고 현재 경로가 루트가 아닌 경우 루트로 리다이렉트
  if (!token && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return children;
};

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
  const [onlineUsers, setOnlineUsers] = useState(new Set());
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
        
        // 온라인 상태 알림
        client.publish({
          destination: '/app/user.status',
          body: JSON.stringify({
            userIdx: userIdx,
            status: 'ONLINE'
          })
        });

        // 유저 상태 변경 구독
        client.subscribe('/topic/status', (message) => {
          try {
            const statusUpdate = JSON.parse(message.body);
            if (Array.isArray(statusUpdate.onlineUsers)) {
              setOnlineUsers(new Set(statusUpdate.onlineUsers.map(String)));
            }
          } catch (error) {
            console.error('상태 업데이트 처리 중 오류:', error);
          }
        });

        // 사용자의 모든 채팅방 관련 업데이트를 받는 구독 추가
        client.subscribe(`/topic/user/${userIdx}/updates`, (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log('WebSocket update received:', update);
            switch (update.type) {
              case 'NEW_MESSAGE':
                console.log('NEW_MESSAGE update:', {
                  roomId: update.roomId,
                  totalUnread: update.totalUnread,
                  messageDTO: update.lastMessage
                });
                updateUnreadCount(update.roomId, update.totalUnread, update.lastMessage);
                break;
              case 'READ_STATUS':
                updateUnreadCount(update.roomId, update.totalUnread);
                break;
            }
          } catch (error) {
            console.error('메시지 처리 중 오류:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected!');
      }
    });

    try {
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Connection error:', error);
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

  // updateUnreadCount 함수 추가
  const updateUnreadCount = (roomId, totalUnread, messageDTO) => {
    console.log('Dispatching unreadCountUpdate event:', {
      roomId,
      totalUnread,
      messageDTO
    });
    const event = new CustomEvent('unreadCountUpdate', {
      detail: { 
        roomId, 
        totalUnread,
        messageDTO
      }
    });
    window.dispatchEvent(event);
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
            <Route path="/" element={
              <Home 
                isLoggedIn={isLoggedIn} 
                userInfo={userInfo}
              />
            } />
            <Route path="/chat/:roomId" element={
              <ProtectedRoute>
                <ChatRoom 
                  userInfo={userInfo} 
                  onlineUsers={onlineUsers}
                />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/friend-requests" element={
              <ProtectedRoute>
                <FriendRequests 
                  isLoggedIn={isLoggedIn} 
                  userInfo={userInfo}
                  onlineUsers={onlineUsers}
                />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
