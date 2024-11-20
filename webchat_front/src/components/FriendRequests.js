import React, { useState, useEffect } from 'react';
import '../styles/FriendRequests.css';

function FriendRequests() {
  const [activeTab, setActiveTab] = useState('friends');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // 임시 데이터로 테스트
    setReceivedRequests([
      { id: 1, username: '김철수', timestamp: new Date() },
      { id: 2, username: '이영희', timestamp: new Date() }
    ]);

    setSentRequests([
      { id: 3, username: '박지성', timestamp: new Date(), status: 'pending' },
      { id: 4, username: '손흥민', timestamp: new Date(), status: 'pending' }
    ]);

    // 친구 목록 임시 데이터
    setFriends([
      { id: 5, username: '강감찬', status: 'offline' },
      { id: 6, username: '이순신', status: 'online' },
      { id: 7, username: '세종대왕', status: 'offline' },
      { id: 8, username: '장영실', status: 'online' }
    ]);
  }, []);

  const handleAccept = async (requestId) => {
    try {
      console.log('친구 요청 수락:', requestId);
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('친구 요청 수락 실패:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      console.log('친구 요청 거절:', requestId);
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('친구 요청 거절 실패:', error);
    }
  };

  const handleBlock = async (requestId) => {
    try {
      console.log('사용자 차단:', requestId);
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('사용자 차단 실패:', error);
    }
  };

  const handleDeleteFriend = (friendId) => {
    // API 호출 로직 추가 예정
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  const handleBlockFriend = (friendId) => {
    // API 호출 로직 추가 예정
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <div className="friends-list">
            {friends.length === 0 ? (
              <p className="no-friends">친구 목록이 비어있습니다.</p>
            ) : (
              <ul>
                {friends.map(friend => (
                  <li key={friend.id} className="friend-item">
                    <div className="friend-info">
                      <div className="friend-avatar"></div>
                      <div className="friend-details">
                        <span className="username">{friend.username}</span>
                        <span className={`status ${friend.status}`}>
                          {friend.status === 'online' ? '온라인' : '오프라인'}
                        </span>
                      </div>
                    </div>
                    <div className="friend-actions">
                      <button className="chat-btn">1:1 채팅</button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteFriend(friend.id)}
                      >
                        삭제
                      </button>
                      <button 
                        className="block-btn"
                        onClick={() => handleBlockFriend(friend.id)}
                      >
                        차단
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'received':
        return (
          <div className="requests-list">
            {receivedRequests.length === 0 ? (
              <p className="no-requests">받은 친구 요청이 없습니다.</p>
            ) : (
              <ul>
                {receivedRequests.map(request => (
                  <li key={request.id} className="request-item">
                    <div className="request-info">
                      <span className="username">{request.username}</span>
                      <span className="timestamp">
                        {request.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="accept-btn"
                        onClick={() => handleAccept(request.id)}
                      >
                        수락
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleReject(request.id)}
                      >
                        거절
                      </button>
                      <button 
                        className="block-btn"
                        onClick={() => handleBlock(request.id)}
                      >
                        차단
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'sent':
        return (
          <div className="requests-list">
            {sentRequests.length === 0 ? (
              <p className="no-requests">보낸 친구 요청이 없습니다.</p>
            ) : (
              <ul>
                {sentRequests.map(request => (
                  <li key={request.id} className="request-item">
                    <div className="request-info">
                      <span className="username">{request.username}</span>
                      <span className="timestamp">
                        {request.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="request-status">
                      대기중
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="friend-requests-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          친구 목록
        </button>
        <button
          className={`tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          받은 요청
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          보낸 요청
        </button>
      </div>
      {renderContent()}
    </div>
  );
}

export default FriendRequests; 