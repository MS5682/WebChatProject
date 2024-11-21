import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import '../styles/FriendsList.css';

function FriendsList() {
  const [activeTab, setActiveTab] = useState('online');
  const [friends, setFriends] = useState({
    online: [
      {
        id: 1,
        name: '김철수',
        status: '온라인',
        lastMessage: '네, 알겠습니다. 내일 회의때 뵐게요!'
      },
      {
        id: 2,
        name: '이영희',
        status: '온라인',
        lastMessage: '프로젝트 자료 보내드렸습니다.'
      }
    ],
    offline: [
      {
        id: 3,
        name: '박지성',
        status: '오프라인',
        lastMessage: '다음 주에 일정 조율해보겠습니다.'
      },
      {
        id: 4,
        name: '최민수',
        status: '오프라인',
        lastMessage: '확인했습니다. 감사합니다.'
      }
    ]
  });

  const truncateMessage = (message) => {
    return message.length > 15 ? message.slice(0, 15) + '...' : message;
  };

  return (
    <div className="friends-list">
      <div className="friends-header">
        <h2>친구 목록</h2>
      </div>

      <div className="friends-tabs">
        <button
          className={`friend-tab ${activeTab === 'online' ? 'active' : ''}`}
          onClick={() => setActiveTab('online')}
        >
          온라인
        </button>
        <button
          className={`friend-tab ${activeTab === 'offline' ? 'active' : ''}`}
          onClick={() => setActiveTab('offline')}
        >
          오프라인
        </button>
      </div>

      <div className="friends-container">
        {friends[activeTab].map(friend => (
          <div key={friend.id} className="friend-card">
            <div className="friend-info">
              <div className="friend-avatar">
                <div className={`status-indicator ${friend.status === '온라인' ? 'online' : 'offline'}`}></div>
                {friend.name.charAt(0)}
              </div>
              <div className="friend-details">
                <h3>{friend.name}</h3>
                <p className="last-message">{truncateMessage(friend.lastMessage)}</p>
              </div>
            </div>
            <div className="friend-actions">
              <button className="chat-button">
                💬 채팅
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendsList; 