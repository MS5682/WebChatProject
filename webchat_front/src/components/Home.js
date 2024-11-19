import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = ({ isLoggedIn }) => {
  const [activeTab, setActiveTab] = useState('open'); // 'open', 'joined', 'direct'
  const [openChatRooms, setOpenChatRooms] = useState([]);
  const [myChatRooms, setMyChatRooms] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);

  useEffect(() => {
    fetchChatRooms();
  }, [isLoggedIn]);

  const fetchChatRooms = async () => {
    try {
      // 더미 데이터
      setOpenChatRooms([
        { id: 1, name: '일반채팅방', description: '누구나 참여가능한 채팅방입니다.', participantCount: 5 },
        { id: 2, name: '정보공유방', description: '정보를 공유하는 채팅방입니다.', participantCount: 3 },
      ]);

      if (isLoggedIn) {
        setMyChatRooms([
          { id: 3, name: '프로젝트 팀', description: '프로젝트 논의방', participantCount: 4 },
          { id: 4, name: '스터디 그룹', description: '알고리즘 스터디', participantCount: 6 },
        ]);

        setDirectMessages([
          { id: 5, name: '김철수', lastMessage: '안녕하세요!', unreadCount: 2 },
          { id: 6, name: '이영희', lastMessage: '네, 알겠습니다.', unreadCount: 0 },
        ]);
      }
    } catch (error) {
      console.error('채팅방 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'open':
        return (
          <div className="chat-rooms-grid">
            {openChatRooms.map(room => (
              <ChatRoomCard key={room.id} room={room} />
            ))}
          </div>
        );
      case 'joined':
        return isLoggedIn ? (
          <div className="chat-rooms-grid">
            {myChatRooms.map(room => (
              <ChatRoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="login-prompt">
            <p>참여중인 채팅방을 보려면 로그인이 필요합니다.</p>
            <Link to="/login" className="login-button">로그인하기</Link>
          </div>
        );
      case 'direct':
        return isLoggedIn ? (
          <div className="chat-rooms-grid">
            {directMessages.map(dm => (
              <DirectMessageCard key={dm.id} dm={dm} />
            ))}
          </div>
        ) : (
          <div className="login-prompt">
            <p>1:1 채팅을 시작하려면 로그인이 필요합니다.</p>
            <Link to="/login" className="login-button">로그인하기</Link>
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
          className={`tab ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          오픈채팅
        </button>
        <button 
          className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          참여중인 채팅
        </button>
        <button 
          className={`tab ${activeTab === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveTab('direct')}
        >
          1:1 채팅
        </button>
      </div>

      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};

const ChatRoomCard = ({ room }) => (
  <div className="chat-room-card">
    <h3>{room.name}</h3>
    <p>{room.description}</p>
    <div className="participant-count">
      <span>참여자: {room.participantCount}명</span>
    </div>
    <Link to={`/chat/${room.id}`} className="join-button">
      참여하기
    </Link>
  </div>
);

const DirectMessageCard = ({ dm }) => (
  <div className="chat-room-card direct-message">
    <h3>{dm.name}</h3>
    <p className="last-message">{dm.lastMessage}</p>
    {dm.unreadCount > 0 && (
      <div className="unread-badge">
        {dm.unreadCount}
      </div>
    )}
    <Link to={`/dm/${dm.id}`} className="join-button">
      대화하기
    </Link>
  </div>
);

export default Home; 