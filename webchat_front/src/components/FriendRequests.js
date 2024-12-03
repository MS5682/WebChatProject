import React, { useState, useEffect} from 'react';
import '../styles/FriendRequests.css';
import { fetchWithToken } from './App';

function FriendRequests({ userInfo, isLoggedIn, onlineUsers }) {
  const [activeTab, setActiveTab] = useState('friends');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  useEffect(() => {
    if (isLoggedIn && userInfo) {
      fetchFriendships();
      
    }
  }, [isLoggedIn, userInfo]);

  const fetchFriendships = async () => {
    try {
      const response = await fetchWithToken(`/friendship/list/${userInfo.userIdx}`);
      const friendships = await response.json();
      
      const newFriends = [];
      const newReceivedRequests = [];
      const newSentRequests = [];
      const newBlockedUsers = [];

      friendships.forEach(friendship => {
        if (friendship.status === 'ACCEPTED') {
          const friend = {
            id: friendship.id,
            friendIdx: friendship.fromUserIdx === userInfo.userIdx 
              ? friendship.toUserIdx 
              : friendship.fromUserIdx,
            username: friendship.fromUserIdx === userInfo.userIdx 
              ? friendship.toUserName 
              : friendship.fromUserName,
            userId: friendship.fromUserIdx === userInfo.userIdx 
              ? friendship.toUserId 
              : friendship.fromUserId,
            status: 'offline'
          };
          newFriends.push(friend);
        } else if (friendship.status === 'PENDING') {
          const request = {
            id: friendship.id,
            username: friendship.fromUserIdx === userInfo.userIdx 
              ? friendship.toUserName 
              : friendship.fromUserName,
            userId: friendship.fromUserIdx === userInfo.userIdx 
              ? friendship.toUserId 
              : friendship.fromUserId,
            timestamp: new Date(friendship.createdAt)
          };
          
          if (friendship.toUserIdx === userInfo.userIdx) {
            newReceivedRequests.push(request);
          } else {
            newSentRequests.push(request);
          }
        } else if (friendship.status === 'BLOCKED' && friendship.fromUserIdx === userInfo.userIdx) {
          const blockedUser = {
            id: friendship.id,
            username: friendship.toUserName,
            userId: friendship.toUserId,
            timestamp: new Date(friendship.createdAt)
          };
          newBlockedUsers.push(blockedUser);
        }
      });

      setFriends(newFriends);
      setReceivedRequests(newReceivedRequests);
      setSentRequests(newSentRequests);
      setBlockedUsers(newBlockedUsers);
    } catch (error) {
      console.error('친구 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await fetchWithToken(`/friendship/response?friendshipId=${requestId}&status=ACCEPTED`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '친구 요청 수락 실패');
      }

      if (result.success) {
        // 받은 요청 목록에서 제거
        const acceptedRequest = receivedRequests.find(req => req.id === requestId);
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        
        // 친구 목록에 추가
        if (acceptedRequest) {
          const newFriend = {
            id: requestId,
            username: acceptedRequest.username,
            userId: acceptedRequest.userId,
            status: 'offline'
          };
          setFriends(prev => [...prev, newFriend]);
        }

        // 선택적: 친구 목록 탭으로 이동
        setActiveTab('friends');
      }
    } catch (error) {
      console.error('친구 요청 수락 실패:', error);
      alert('친구 요청 수락에 실패했습니다.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetchWithToken(`/friendship/response?friendshipId=${requestId}&status=REJECTED`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '친구 요청 거절 실패');
      }

      if (result.success) {
        // 받은 요청 목록에서 제거
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        alert('친구 요청을 거절했습니다.');
      }
    } catch (error) {
      console.error('친구 요청 거절 실패:', error);
      alert('친구 요청 거절에 실패했습니다.');
    }
  };

  const handleBlock = async (requestId) => {
    try {
      const response = await fetchWithToken(`/friendship/response?friendshipId=${requestId}&status=BLOCKED&userIdx=${userInfo.userIdx}`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '사용자 차단 실패');
      }

      if (result.success) {
        // 받은 요청 목록에서 제거
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        alert('사용자를 차단했습니다.');
      }
    } catch (error) {
      console.error('사용자 차단 실패:', error);
      alert('사용자 차단에 실패했습니다.');
    }
  };

  const handleDeleteFriend = async (friendId) => {
    try {
      const response = await fetchWithToken(`/friendship/response?friendshipId=${friendId}&status=REJECTED`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '친구 삭제 실패');
      }

      if (result.success) {
        // 친구 목록에서 제거
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
        alert('친구를 삭제했습니다.');
      }
    } catch (error) {
      console.error('친구 삭제 실패:', error);
      alert('친구 삭제에 실패했습니다.');
    }
  };

  const handleBlockFriend = async (friendId) => {
    try {
      const response = await fetchWithToken(`/friendship/response?friendshipId=${friendId}&status=BLOCKED`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '친구 차단 실패');
      }

      if (result.success) {
        // 친구 목록에서 제거
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
        alert('친구를 차단했습니다.');
      }
    } catch (error) {
      console.error('친구 차단 실패:', error);
      alert('친구 차단에 실패했습니다.');
    }
  };

  const handleSearch = async () => {
    try {
      setSearchError('');
      const response = await fetchWithToken(`/friendship/find?keyword=${searchUserId}`);
      const users = await response.json();
      
      if (!response.ok) {
        throw new Error(users.message || '사용자를 찾을 수 없습니다.');
      }

      if (users.length > 0) {
        // 친구가 아닌 첫 번째 사용자 찾기
        const availableUser = users.find(user => {
          const isAlreadyFriend = friends.some(friend => friend.userId === user.userId);
          const isSelf = user.userId === userInfo.userId;
          return !isAlreadyFriend && !isSelf;
        });

        if (availableUser) {
          setSearchResult(availableUser);
        } else {
          setSearchError('추가 가능한 사용자가 없습니다.');
          setSearchResult(null);
        }
      } else {
        setSearchError('사용자를 찾을 수 없습니다.');
        setSearchResult(null);
      }
    } catch (error) {
      setSearchError(error.message);
      setSearchResult(null);
    }
  };

  const handleAddFriend = async () => {
    try {
      if (!searchResult) return;
      
      const response = await fetchWithToken(`/friendship/request?fromUserIdx=${userInfo.userIdx}&toUserIdx=${searchResult.idx}`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '친구 요청 실패');
      }

      // 성공적으로 요청을 보냈다면
      if (result.success) {
        // 검색 결과를 sent requests에 추가
        const newRequest = {
          id: result.data,
          friendIdx: searchResult.idx,
          username: searchResult.name,
          userId: searchResult.userId,
          timestamp: new Date()
        };
        setSentRequests(prev => [...prev, newRequest]);
        
        // 검색 결과 초기화
        setSearchResult(null);
        setSearchUserId('');
        
        // 성공 메시지 표시 (선택사항)
        setSearchError('');
        alert('친구 요청을 보냈습니다.');
      }
    } catch (error) {
      console.error('친구 추가 실패:', error);
      setSearchError(error.message);
    }
  };

  const handleChatStart = async (friendIdx) => {
    try {
      const response = await fetchWithToken(`/chat-rooms/private?userIdx=${userInfo.userIdx}&friendIdx=${friendIdx}`, {
        method: 'POST'
      });

      const result = await response.json();
      console.log(result);
      if (!response.ok) {
        throw new Error(result.message || '채팅방 생성 실패');
      }

      if (result.success && result.data) {
        // 채팅방으로 이동
        window.location.href = `/chat/${result.data}?isActive=true`;
      }
    } catch (error) {
      console.error('채팅방 생성/이동 실패:', error);
      alert('채팅방으로 이동하는데 실패했습니다.');
    }
  };

  const handleUnblock = async (friendshipId) => {
    try {
      const response = await fetchWithToken(`/friendship/response?friendshipId=${friendshipId}&status=REJECTED`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '차단 해제 실패');
      }

      if (result.success) {
        setBlockedUsers(prev => prev.filter(user => user.id !== friendshipId));
        alert('차단이 해제되었습니다.');
      }
    } catch (error) {
      console.error('차단 해제 실패:', error);
      alert('차단 해제에 실패했습니다.');
    }
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
                        <span className={`status ${onlineUsers.has(String(friend.friendIdx)) ? 'online' : 'offline'}`}>
                          {onlineUsers.has(String(friend.friendIdx)) ? '온라인' : '오프라인'}
                        </span>
                      </div>
                    </div>
                    <div className="friend-actions">
                      <button 
                        className="chat-btn"
                        onClick={() => handleChatStart(friend.friendIdx)}
                      >
                        채팅
                      </button>
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
            
            {/* 친구 검색 섹션 추가 */}
            <div className="friend-search-section">
              <h3>친구 추가</h3>
              <div className="search-container">
                <input
                  type="text"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  placeholder="친구의 ID를 입력하세요"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>검색</button>
              </div>
              
              {searchError && (
                <p className="search-error">{searchError}</p>
              )}
              
              {searchResult && (
                <div className="search-result">
                  <div className="user-info">
                    <div className="friend-avatar"></div>
                    <div className="friend-details">
                      <span className="username">{searchResult.name}</span>
                      <span className="user-id">@{searchResult.userId}</span>
                    </div>
                  </div>
                  <button 
                    className="add-friend-btn"
                    onClick={handleAddFriend}
                  >
                    친구 추가
                  </button>
                </div>
              )}
            </div>
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
      case 'blocked':
        return (
          <div className="requests-list">
            {blockedUsers.length === 0 ? (
              <p className="no-requests">차단된 사용자가 없습니다.</p>
            ) : (
              <ul>
                {blockedUsers.map(user => (
                  <li key={user.id} className="request-item">
                    <div className="request-info">
                      <span className="username">{user.username}</span>
                      <span className="timestamp">
                        {user.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="unblock-btn"
                        onClick={() => handleUnblock(user.id)}
                      >
                        차단 해제
                      </button>
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
        <button
          className={`tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          차단 목록
        </button>
      </div>
      {renderContent()}
    </div>
  );
}

export default FriendRequests; 