import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import CreateChatRoomModal from './CreateChatRoomModal';

const Home = ({ isLoggedIn, userInfo }) => {
  const [activeTab, setActiveTab] = useState('joined');
  const [subTab, setSubTab] = useState('direct');
  const [joinedChatRooms, setJoinedChatRooms] = useState({
    direct: [], // PRIVATE_CHAT
    group: [], // PROTECTED_GROUP
    open: []   // PUBLIC_GROUP
  });
  const [openChatRooms, setOpenChatRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRoomType, setCreateRoomType] = useState(null); // 'group' 또는 'open'

  useEffect(() => {
    if (isLoggedIn && userInfo.userIdx) {
      fetchChatRooms();
      fetchPublicChatRooms();
    }
  }, [isLoggedIn, userInfo.userIdx]);

  useEffect(() => {
    const handleUnreadCountUpdate = (event) => {
      const { roomId, totalUnread, messageDTO } = event.detail;
      console.log('Received unreadCountUpdate event:', {
        roomId,
        totalUnread,
        messageDTO
      });

      setJoinedChatRooms(prev => {
        const newRooms = { ...prev };
        ['direct', 'group', 'open'].forEach(type => {
          newRooms[type] = prev[type].map(room => {
            if (room.roomId === roomId) {
              console.log('Updating room:', room.roomId, {
                currentLatestMessage: room.latestMessage,
                newMessage: messageDTO?.content,
                currentLastMessageTime: room.lastMessageTime,
                newMessageTime: messageDTO?.time
              });

              const updates = {
                ...room,
                unreadCount: totalUnread
              };

              if (messageDTO) {
                updates.latestMessage = messageDTO.content;
                updates.lastMessageTime = messageDTO.time;
              }

              return updates;
            }
            return room;
          });
        });
        return newRooms;
      });
    };

    window.addEventListener('unreadCountUpdate', handleUnreadCountUpdate);
    return () => {
      window.removeEventListener('unreadCountUpdate', handleUnreadCountUpdate);
    };
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('/chat-rooms/user/'+userInfo.userIdx);
      const chatRooms = await response.json();

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
      const response = await fetch(`/chat-rooms/public?userIdx=${userInfo.userIdx}`);
      const publicRooms = await response.json();
      console.log('publicRooms', publicRooms);
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

          {subTab !== 'direct' && (
            <button 
              className="create-chat-create-room-button"
              onClick={() => {
                setCreateRoomType(subTab);
                setShowCreateModal(true);
              }}
            >
              +
            </button>
          )}
        </div>

        <div className="chat-rooms-grid">
          {subTab === 'direct' && joinedChatRooms.direct.map(room => (
            <ChatRoomCard 
              key={room.roomId}
              room={{
                id: room.roomId,
                name: room.participantNames,
                lastMessage: room.latestMessage,
                lastMessageTime: room.lastMessageTime,
                unreadCount: room.unreadCount,
                participantCount: room.participantCount,
                maxParticipants: room.maxParticipants,
                isActive: room.isActive
              }}
              type="direct"
              showInactiveOverlay={true}
            />
          ))}
          {subTab === 'group' && joinedChatRooms.group.map(room => {
            const formatParticipantNames = (names) => {
              if (!names) return '';
              const participants = names.split(',');
              if (participants.length > 3) {
                return `${participants.slice(0, 3).join(',')}, ...`;
              }
              return names;
            };

            return (
              <ChatRoomCard 
                key={room.roomId}
                room={{
                  id: room.roomId,
                  name: room.roomName !== null ? room.roomName : formatParticipantNames(room.participantNames),
                  lastMessage: room.latestMessage,
                  lastMessageTime: room.lastMessageTime,
                  unreadCount: room.unreadCount,
                  participantCount: room.participantCount,
                  maxParticipants: room.maxParticipants,
                  isActive: room.isActive
                }}
                type="group"
                showInactiveOverlay={true}
              />
            );
          })}
          {subTab === 'open' && joinedChatRooms.open.map(room => (
            <ChatRoomCard 
              key={room.roomId}
              room={{
                id: room.roomId,
                name: room.roomName,
                lastMessage: room.latestMessage,
                lastMessageTime: room.lastMessageTime,
                unreadCount: room.unreadCount,
                participantCount: room.participantCount,
                maxParticipants: room.maxParticipants,
                isActive: room.isActive
              }}
              type="open"
              showInactiveOverlay={true}
            />
          ))}
          
         
        </div>

        {showCreateModal && (
          <CreateChatRoomModal
            type={createRoomType}
            onClose={() => setShowCreateModal(false)}
            userInfo={userInfo}
          />
        )}
      </div>
    );
  };

  const renderOpenRooms = () => {
    return (
      <div className="chat-rooms-grid">
        {openChatRooms.map(room => (
          <ChatRoomCard 
            key={room.id}
            room={room}
            type="open"
            showInactiveOverlay={true}
            userInfo={userInfo}
          />
        ))}
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
        return renderOpenRooms();
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

// JoinChatRoomModal 컴포넌트 추가
const JoinChatRoomModal = ({ room, onClose, userInfo }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/chat-rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: room.id,
          userIdx: userInfo.userIdx,
          password: room.hasPassword ? password : null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '채팅방 참여에 실패했습니다.');
      }

      if (result.success) {
        window.location.href = `/chat/${room.id}?isActive=${room.isActive}`;
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="create-chat-modal-overlay">
      <div className="create-chat-modal-content">
        <h2>{room.name}</h2>
        <form onSubmit={handleJoin}>
          {room.hasPassword && (
            <div className="create-chat-form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          <div className="create-chat-modal-buttons">
            <button type="submit">참여하기</button>
            <button type="button" className="cancel-button" onClick={onClose}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ChatRoomCard 컴포넌트 수정
const ChatRoomCard = ({ room, type, showInactiveOverlay, userInfo }) => {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const truncateMessage = (message, maxLength = 15) => {
    if (!message) return '';
    return message.length > maxLength 
      ? `${message.substring(0, maxLength)}......` 
      : message;
  };

  const handleClick = (e) => {
    e.preventDefault();
    
    if (type === 'open') {
      setShowJoinModal(true);
    } else {
      if (window.chatWebSocket) {
        window.chatWebSocket.deactivate();
      }
      setTimeout(() => {
        window.location.href = `/chat/${room.id}?isActive=${room.isActive}`;
      }, 100);
    }
  };

  return (
    <>
      <div 
        onClick={handleClick} 
        className={`chat-room-card-link ${!room.isActive && showInactiveOverlay ? 'inactive' : ''}`}
      >
        <div className="chat-room-card">
          {!room.isActive && showInactiveOverlay && (
            <div className="inactive-overlay">
              비활성화된 채팅방입니다
            </div>
          )}
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
              {truncateMessage(room.lastMessage)}
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

            
          </div>
        </div>
      </div>
      {showJoinModal && (
        <JoinChatRoomModal
          room={room}
          onClose={() => setShowJoinModal(false)}
          userInfo={userInfo}
        />
      )}
    </>
  );
};

export default Home; 