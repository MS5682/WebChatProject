import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import '../styles/FriendsList.css';

function FriendsList() {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [friends, setFriends] = useState([
    { id: 1, name: "홍길동" },
    { id: 2, name: "김철수" },
    // ... 더미 데이터
  ]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        console.log('Connected to WebSocket');
        
        // 사용자 상태 구독
        client.subscribe('/topic/status', (message) => {
          const status = JSON.parse(message.body);
          setOnlineUsers(prevUsers => {
            const newUsers = new Set(prevUsers);
            if (status.status === 'ONLINE') {
              newUsers.add(status.userId);
            } else {
              newUsers.delete(status.userId);
            }
            return newUsers;
          });
        });

        // 자신의 접속 상태 서버에 알림
        client.publish({
          destination: '/app/status',
          body: JSON.stringify({ status: 'ONLINE' })
        });
      }
    });

    client.activate();

    return () => {
      if (client.connected) {
        // 연결 종료 시 오프라인 상태 알림
        client.publish({
          destination: '/app/status',
          body: JSON.stringify({ status: 'OFFLINE' })
        });
        client.deactivate();
      }
    };
  }, []);

  const handleFriendClick = (friend, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: rect.top,
      left: rect.left - 140
    });
    setSelectedFriend(friend);
  };

  const startChat = () => {
    navigate(`/chat/dm/${selectedFriend.id}`);
    setSelectedFriend(null);
  };

  return (
    <div className="friends-sidebar">
      <div className="friends-header">
        <h3>친구 목록</h3>
      </div>
      <div className="friends-list">
        {friends.map(friend => (
          <div 
            key={friend.id} 
            className="friend-item"
            onClick={(e) => handleFriendClick(friend, e)}
          >
            <div className="friend-avatar"></div>
            <div className="friend-info">
              <span className="friend-name">{friend.name}</span>
              <span className={`friend-status ${onlineUsers.has(friend.id) ? 'online' : ''}`}>
                {onlineUsers.has(friend.id) ? '온라인' : '오프라인'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 친구 선택 시 나타나는 팝업 */}
      {selectedFriend && (
        <>
          <div className="popup-overlay" onClick={() => setSelectedFriend(null)} />
          <div 
            className="friend-popup"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`
            }}
          >
            <button className="chat-button" onClick={startChat}>
              1:1 채팅하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FriendsList; 