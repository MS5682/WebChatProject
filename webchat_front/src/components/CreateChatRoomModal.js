import React, { useState, useEffect } from 'react';
import '../styles/CreateChatRoomModal.css';

const CreateChatRoomModal = ({ type, onClose, userInfo }) => {
  const [step, setStep] = useState(1); // 1: 채팅방 설정, 2: 친구선택
  const [roomName, setRoomName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [password, setPassword] = useState('');  // 비밀번호 상태 추가
  const [hasPassword, setHasPassword] = useState(false);  // 비밀번호 사용 여부 상태 추가
  

  useEffect(() => {
    if (type === 'group') {
      const fetchFriendsList = async () => {
        try {
          const response = await fetch(`/friendship/list/${userInfo.userIdx}?status=ACCEPTED`);
          const friendships = await response.json();
          
          const friends = friendships.map(friendship => {
            const isFromUser = friendship.fromUserIdx === userInfo.userIdx;
            return {
              userIdx: isFromUser ? friendship.toUserIdx : friendship.fromUserIdx,
              name: isFromUser ? friendship.toUserName : friendship.fromUserName
            };
          });

          setFriendsList(friends);
        } catch (error) {
          console.error('친구 목록을 가져오는데 실패했습니다:', error);
        }
      };

      fetchFriendsList();
    }
  }, [type, userInfo.userIdx]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requestData = {
      roomName: roomName,  
      roomType: type === 'group' ? 'PROTECTED_GROUP' : 'PUBLIC_GROUP',
      maxParticipants: maxParticipants,
      password: type === 'open' && hasPassword ? password : null,
      participants: type === 'group' ? [userInfo.userIdx, ...selectedFriends] : [userInfo.userIdx]
    };

    try {
      const response = await fetch('/chat-rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '채팅방 생성에 실패했습니다.');
      }

      if (result.success) {
        alert('채팅방이 생성되었습니다.');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다.');
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSkip = () => {
    setRoomName(null);
    setMaxParticipants(100);
    setStep(2);
  };

  const renderStep1 = () => (
    <>
      <h2>그룹 채팅방 만들기</h2>
      <form onSubmit={handleNext}>
        <div className="create-chat-form-group">
          <label>채팅방 이름</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
        </div>

        <div className="create-chat-form-group">
          <label>최대 참여자 수</label>
          <input
            type="number"
            min="2"
            max="100"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="create-chat-modal-buttons">
          <button type="button" className="skip-button" onClick={handleSkip}>건너뛰기</button>
          <button type="submit" className="next-button">다음</button>
          <button type="button" className="cancel-button" onClick={onClose}>
            취소
          </button>
        </div>
      </form>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2>친구 선택</h2>
      <div className="create-chat-form-group">
        <div className="create-chat-friends-list">
          {friendsList.map(friend => (
            <label key={friend.userIdx} className="create-chat-friend-item">
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend.userIdx)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFriends([...selectedFriends, friend.userIdx]);
                  } else {
                    setSelectedFriends(selectedFriends.filter(id => id !== friend.userIdx));
                  }
                }}
              />
              <span>{friend.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="create-chat-modal-buttons">
        <button type="button" className="prev-button" onClick={() => setStep(1)}>이전</button>
        <button 
          type="button" 
          className="create-button"
          onClick={handleSubmit}
          disabled={selectedFriends.length === 0}
        >
          생성
        </button>
        <button type="button" className="cancel-button" onClick={onClose}>
          취소
        </button>
      </div>
    </>
  );

  return (
    <div className="create-chat-modal-overlay">
      <div className="create-chat-modal-content">
        {type === 'group' ? (
          step === 1 ? renderStep1() : renderStep2()
        ) : (
          <>
            <h2>오픈 채팅방 만들기</h2>
            <form onSubmit={handleSubmit}>
              <div className="create-chat-form-group">
                <label>채팅방 이름</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
              </div>

              <div className="create-chat-form-group">
                <label>최대 참여자 수</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="create-chat-form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={hasPassword}
                    onChange={(e) => setHasPassword(e.target.checked)}
                  />
                  비밀번호 설정
                </label>
                {hasPassword && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                )}
              </div>

              <div className="create-chat-modal-buttons">
                <button type="submit" className="create-button">생성</button>
                <button type="button" className="cancel-button" onClick={onClose}>
                  취소
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateChatRoomModal; 