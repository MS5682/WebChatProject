import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = ({ isLoggedIn, userInfo }) => {
  const [mainTab, setMainTab] = useState('joined');
  const [subTab, setSubTab] = useState('direct');
  const [joinedChatRooms, setJoinedChatRooms] = useState({
    direct: [
      { 
        id: 1, 
        name: '김철수',
        lastMessage: '네 알겠습니다!',
        lastMessageTime: '14:30',
        unreadCount: 2
      },
      { 
        id: 2, 
        name: '이영희',
        lastMessage: '오늘 회의 몇시인가요?',
        lastMessageTime: '12:15',
        unreadCount: 0
      },
      { 
        id: 3, 
        name: '박지성',
        lastMessage: '자료 보내드렸습니다.',
        lastMessageTime: '어제',
        unreadCount: 1
      }
    ],
    group: [
      {
        id: 4,
        name: '프로젝트 팀',
        description: '웹챗 프로젝트 개발팀',
        participantCount: 5,
        lastMessage: '다음 회의는 목요일입니다.',
        lastMessageTime: '10:45'
      },
      {
        id: 5,
        name: '알고리즘 스터디',
        description: '코딩 테스트 준비방',
        participantCount: 8,
        lastMessage: '오늘 문제 공유드립니다.',
        lastMessageTime: '어제'
      }
    ],
    open: [
      {
        id: 6,
        name: '개발자 네트워킹',
        description: '개발자들의 자유로운 소통공간',
        participantCount: 125,
        lastMessage: '백엔드 개발자 구합니다.',
        lastMessageTime: '방금'
      }
    ]
  });

  const [openChatRooms, setOpenChatRooms] = useState([
    {
      id: 7,
      name: '취업 정보 공유방',
      description: 'IT 취업 정보 공유 및 면접 팁',
      participantCount: 234,
      tags: ['취업', 'IT', '면접']
    },
    {
      id: 8,
      name: '프론트엔드 개발자 모임',
      description: 'React, Vue, Angular 등 프론트엔드 개발자 모임',
      participantCount: 89,
      tags: ['프론트엔드', 'React', 'Vue']
    },
    {
      id: 9,
      name: '백엔드 개발자 모임',
      description: 'Spring, Node.js 등 백엔드 개발자 모임',
      participantCount: 156,
      tags: ['백엔드', 'Spring', 'Node.js']
    },
    {
      id: 10,
      name: '코딩 입문방',
      description: '코딩을 시작하는 분들을 위한 방',
      participantCount: 67,
      tags: ['입문', '초보', '질문']
    }
  ]);

  useEffect(() => {
    fetchChatRooms();
  }, [isLoggedIn]);

  const fetchChatRooms = async () => {
    try {
      // 오픈 채팅방 목록 가져오기
      const openResponse = await fetch('/chat/rooms/open');
      const openData = await openResponse.json();
      setOpenChatRooms(openData);

      if (isLoggedIn) {
        // 참여중인 채팅방 목록 가져오기
        const joinedResponse = await fetch('/chat/rooms/joined', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const joinedData = await joinedResponse.json();
        setJoinedChatRooms({
          direct: joinedData.direct || [],
          group: joinedData.group || [],
          open: joinedData.open || []
        });
      }
    } catch (error) {
      console.error('채팅방 목록을 가져오는데 실패했습니다:', error);
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
            <ChatRoomCard key={room.id} room={room} type="direct" />
          ))}
          {subTab === 'group' && joinedChatRooms.group.map(room => (
            <ChatRoomCard key={room.id} room={room} type="group" />
          ))}
          {subTab === 'open' && joinedChatRooms.open.map(room => (
            <ChatRoomCard key={room.id} room={room} type="open" />
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (mainTab) {
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
              <ChatRoomCard key={room.id} room={room} type="open" />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home">
      <div className="main-tabs">
        <button
          className={`main-tab ${mainTab === 'joined' ? 'active' : ''}`}
          onClick={() => setMainTab('joined')}
        >
          참여중인 채팅방
        </button>
        <button
          className={`main-tab ${mainTab === 'open' ? 'active' : ''}`}
          onClick={() => setMainTab('open')}
        >
          오픈채팅 목록
        </button>
      </div>
      {renderTabContent()}
    </div>
  );
};

const ChatRoomCard = ({ room, type }) => {
  return (
    <div className="chat-room-card">
      <div className="room-header">
        <div className="room-title">
          <div className="room-icon">
            {type === 'direct' ? '👤' : type === 'group' ? '👥' : '🌐'}
          </div>
          <h3>{room.name}</h3>
        </div>
        {room.unreadCount > 0 && type === 'direct' && (
          <span className="unread-count">{room.unreadCount}</span>
        )}
      </div>
      
      <div className="room-content">
        <p className="description">
          {type === 'direct' ? room.lastMessage : room.description}
        </p>
      </div>
      
      <div className="room-footer">
        <div className="room-info">
          <span className="time">
            {type === 'direct' && <span className="icon">⏰ </span>}
            {room.lastMessageTime}
          </span>
          {(type === 'group' || type === 'open') && (
            <span className="participant-count">
              <span className="icon">👥 </span>
              {room.participantCount}명
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