import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = ({ isLoggedIn, userInfo }) => {
  const [activeTab, setActiveTab] = useState('joined');
  const [subTab, setSubTab] = useState('direct');
  const [joinedChatRooms, setJoinedChatRooms] = useState({
    direct: [], // PRIVATE_CHAT
    group: [], // PROTECTED_GROUP
    open: []   // PUBLIC_GROUP
  });
  const [openChatRooms, setOpenChatRooms] = useState([]);

  useEffect(() => {
    if (isLoggedIn && userInfo.userIdx) {
      fetchChatRooms();
    }
    fetchPublicChatRooms();
  }, [isLoggedIn, userInfo]);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('/chat-rooms/user/'+userInfo.userIdx);
      const chatRooms = await response.json();
      console.log(chatRooms);

      // 채팅방 타입별로 분류
      const sortedRooms = {
        direct: chatRooms.filter(room => room.roomType === 'PRIVATE_CHAT'),
        group: chatRooms.filter(room => room.roomType === 'PROTECTED_GROUP'),
        open: chatRooms.filter(room => room.roomType === 'PUBLIC_GROUP')
      };
      
      setJoinedChatRooms(sortedRooms);
    } catch (error) {
      console.error('채팅방 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const fetchPublicChatRooms = async () => {
    try {
      const response = await fetch('/chat-rooms/public');
      const publicRooms = await response.json();
      setOpenChatRooms(publicRooms);
    } catch (error) {
      console.error('오픈채팅방 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const renderJoinedRooms = () => {
    return (
      <div className="joined-rooms">
        <div className="sub-tabs">
          <button
            className={`sub-tab ${subTab === 'direct' ? 'active' : ''}`}
            onClick={() => setSubTab('direct')}
          >
            1:1 채팅
          </button>
          <button
            className={`sub-tab ${subTab === 'group' ? 'active' : ''}`}
            onClick={() => setSubTab('group')}
          >
            그룹 채팅
          </button>
          <button
            className={`sub-tab ${subTab === 'open' ? 'active' : ''}`}
            onClick={() => setSubTab('open')}
          >
            참여중인 오픈채팅
          </button>
        </div>

        <div className="chat-rooms-grid">
          {subTab === 'direct' && joinedChatRooms.direct.map(room => (
            <ChatRoomCard 
              key={room.roomId}
              room={{
                id: room.roomId,
                name: room.roomName,
                lastMessage: room.latestMessage,
                lastMessageTime: room.lastMessageTime,
                unreadCount: room.unreadCount,
                participantCount: room.currentParticipants,
                maxParticipants: room.maxParticipants
              }} 
              type="direct"
            />
          ))}
          {subTab === 'group' && joinedChatRooms.group.map(room => (
            <ChatRoomCard 
              key={room.roomId}
              room={{
                id: room.roomId,
                name: room.roomName,
                lastMessage: room.latestMessage,
                lastMessageTime: room.lastMessageTime,
                unreadCount: room.unreadCount,
                participantCount: room.currentParticipants,
                maxParticipants: room.maxParticipants
              }} 
              type="group"
            />
          ))}
          {subTab === 'open' && joinedChatRooms.open.map(room => (
            <ChatRoomCard 
              key={room.roomId}
              room={{
                id: room.roomId,
                name: room.roomName,
                lastMessage: room.latestMessage,
                lastMessageTime: room.lastMessageTime,
                unreadCount: room.unreadCount,
                participantCount: room.currentParticipants,
                maxParticipants: room.maxParticipants
              }} 
              type="open"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'joined':
        return isLoggedIn ? (
          renderJoinedRooms()
        ) : (
          <div className="login-prompt">
            <p>참여중인 채팅방을 보려면 로그인이 필요합니다.</p>
            <Link to="/login" className="login-button">로그인하기</Link>
          </div>
        );
      case 'open':
        return (
          <div className="chat-rooms-grid">
            {openChatRooms.map(room => (
              <ChatRoomCard 
                key={room.id}
                room={{
                  id: room.id,
                  name: room.name,
                  lastMessageTime: room.lastMessageTime,
                  participantCount: room.currentParticipants,
                  maxParticipants: room.maxParticipants,
                  hasPassword: room.hasPassword
                }} 
                type="open"
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          참여중인 채팅방
        </button>
        <button
          className={`tab ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          오픈채팅 목록
        </button>
      </div>
      {renderTabContent()}
    </div>
  );
};

// 시간 포맷팅 함수 추가
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // 날짜 포맷 옵션
  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  const dateOptions = {
    month: 'long',
    day: 'numeric'
  };
  
  // 같은 날짜인지 확인
  const isToday = messageDate.toDateString() === now.toDateString();
  
  // 어제인지 확인
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();
  
  if (isToday) {
    // 오늘이면 시간만 표시 (오전/오후 포함)
    return messageDate.toLocaleTimeString('ko-KR', timeOptions);
  } else if (isYesterday) {
    // 어제면 '어제'로 표시
    return '어제';
  } else {
    // 그 외에는 월/일 표시
    return messageDate.toLocaleDateString('ko-KR', dateOptions);
  }
};

// ChatRoomCard 컴포넌트 수정
const ChatRoomCard = ({ room, type }) => {
  return (
    <div className="chat-room-card">
      <div className="room-header">
        <div className="room-title">
          <div className="room-icon">
            {type === 'direct' ? '👤' : type === 'group' ? '👥' : '🌐'}
          </div>
          <h3>
            {room.name}
            {type === 'open' && room.hasPassword && (
              <span className="lock-icon">🔒</span>
            )}
          </h3>
        </div>
        {room.unreadCount > 0 && (
          <span className="unread-count">{room.unreadCount}</span>
        )}
      </div>
      
      <div className="room-content">
        <p className="description">
          { room.lastMessage}
        </p>
      </div>
      
      <div className="room-footer">
        <div className="room-info">
          <span className="time">
            {formatMessageTime(room.lastMessageTime)}
          </span>
          {(type === 'group' || type === 'open') && (
            <span className="participant-count">
              <span className="icon">👥 </span>
              {room.participantCount}/{room.maxParticipants}
            </span>
          )}
        </div>

        {room.tags && (
          <div className="room-tags">
            {room.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 