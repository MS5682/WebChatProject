import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiPaperclip, FiImage, FiArrowLeft } from 'react-icons/fi';
import '../styles/ChatRoom.css';

function useChatRoom(userInfo) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const isActive = new URLSearchParams(location.search).get('isActive') === 'true';
  const [readOnlyMode, setReadOnlyMode] = useState(!isActive);
  
  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem(`chat-messages-${roomId}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [userListWidth, setUserListWidth] = useState(200);
  const [participants, setParticipants] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastReadTimes, setLastReadTimes] = useState({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const clientRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const isFirstLoad = useRef(true);

  const fetchParticipants = useCallback(async () => {
    try {
      const response = await fetch(`/chat-rooms/participant/${roomId}`);
      if (!response.ok) {
        throw new Error('참여자 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('참여자 목록 조회 오류:', error);
    }
  }, [roomId]);

  const fetchLastReadTimes = useCallback(async () => {
    try {
      const response = await fetch(`/chat-rooms/${roomId}/last-read-times`);
      if (!response.ok) throw new Error('Failed to fetch last read times');
      const times = await response.json();
      setLastReadTimes(times);
    } catch (error) {
      console.error('Error fetching last read times:', error);
    }
  }, [roomId]);

  const updateLastReadTime = useCallback(async () => {
    try {
      const response = await fetch('/chat-rooms/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: roomId,
          userIdx: userInfo.userIdx
        })
      });

      if (!response.ok) {
        throw new Error('읽은 시간 갱신 실패');
      }

      await fetchLastReadTimes();
    } catch (error) {
      console.error('읽은 시간 갱신 중 오류:', error);
    }
  }, [roomId, userInfo.userIdx, fetchLastReadTimes]);

  const fetchUnreadMessages = useCallback(async () => {
    if (!userInfo || !userInfo.userIdx) {
      console.log('사용자 정보가 없습니다.');
      return;
    }

    try {
      const lastReadResponse = await fetch(`/chat-rooms/${roomId}/last-read-times`);
      if (!lastReadResponse.ok) {
        throw new Error('마지막 읽은 시간 로드 실패');
      }
      const lastReadTimes = await lastReadResponse.json();
      const myLastReadTime = lastReadTimes[userInfo.userIdx];

      const response = await fetch(`/chat-rooms/${roomId}/unread-messages?userIdx=${userInfo.userIdx}`);
      if (!response.ok) {
        throw new Error('읽지 않은 메시지 로드 실패');
      }
      const unreadMessages = await response.json();
      
      if (unreadMessages.length > 0) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            type: 'UNREAD_MARKER',
            content: '여기까지 읽으셨습니다',
            time: myLastReadTime || new Date().toISOString(),
            sender: 'system',
            temporary: true
          },
          ...unreadMessages
        ]);
        
        await updateLastReadTime();
      }
    } catch (error) {
      console.error('읽지 않은 메시지 처리 중 오류:', error);
    }
  }, [roomId, userInfo, updateLastReadTime]);

  const connectWebSocket = useCallback((user) => {
    if (!isActive) return;
    
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket 연결 성공');
        
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

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            console.log(message);
            const receivedMessage = JSON.parse(message.body);
            
            if (receivedMessage.sender !== userInfo.name) {
              setMessages(prevMessages => [...prevMessages, receivedMessage]);
              updateLastReadTime();
            }
          } catch (error) {
            console.error('메시지 처리 중 오류:', error);
          }
        });

        client.subscribe(`/topic/room/${roomId}/read-status`, (message) => {
          try {
            const readStatus = JSON.parse(message.body);
            
            setLastReadTimes(prev => ({
              ...prev,
              [readStatus.userIdx]: readStatus.lastReadTime
            }));
          } catch (error) {
            console.error('읽음 상태 업데이트 처리 중 오류:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('WebSocket 연결 해제');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
      },
      onWebSocketClose: (event) => {
        console.error('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      }
    });

    try {
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Connection error:', error);
    }
  }, [roomId, userInfo.name, updateLastReadTime, isActive]);

  const handleMessageSubmit = useCallback(async (message) => {
    const messageData = {
      type: 'CHAT',
      content: message,
      sender: userInfo.name,
      roomId: roomId,
      time: new Date().toISOString()
    };

    // 로컬에서 먼저 메시지 추가
    setMessages(prevMessages => [...prevMessages, messageData]);

    // WebSocket으로 전송
    await Promise.resolve(clientRef.current.publish({
      destination: `/app/chat.room/${roomId}/send`,
      body: JSON.stringify(messageData)
    }));

    setTimeout(async () => {
      await updateLastReadTime();
    }, 100);
  }, [userInfo.name, roomId, updateLastReadTime]);

  const handleMouseDown = useCallback((e) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = userListWidth;

    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.max(200, Math.min(400, startWidth.current + delta));
      setUserListWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [userListWidth]);

  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollToBottomInstantly = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, []);

  const getUnreadCount = useCallback((messageTime) => {
    const readCount = Object.values(lastReadTimes).filter(time => 
      new Date(time) >= new Date(messageTime)
    ).length;
    return participants.length - readCount;
  }, [lastReadTimes, participants]);

  const initializeRoom = useCallback(async () => {
    try {
      if (userInfo?.userIdx) {
        await connectWebSocket(userInfo.name);
        await fetchParticipants();
        await fetchLastReadTimes();
        await fetchUnreadMessages();
      }
    } catch (error) {
      console.error('채팅방 초기화 중 오류:', error);
    }
  }, [userInfo, connectWebSocket, fetchParticipants, fetchLastReadTimes, fetchUnreadMessages]);

  useEffect(() => {
    initializeRoom();
    
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [initializeRoom]);

  useEffect(() => {
    const permanentMessages = messages.filter(msg => !msg.temporary);
    localStorage.setItem(`chat-messages-${roomId}`, JSON.stringify(permanentMessages));
  }, [messages, roomId]);

  useEffect(() => {
    if (isFirstLoad.current) {
      // 약간의 지연을 주어 DOM이 완전히 렌더링된 후 스크롤
      setTimeout(() => {
        scrollToBottomInstantly();
        isFirstLoad.current = false;
      }, 100);
    } else {
      const { scrollHeight, scrollTop, clientHeight } = chatMessagesRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      const lastMessage = messages[messages.length - 1];
      const isMyMessage = lastMessage?.sender === userInfo.name;

      if (isNearBottom || isMyMessage) {
        scrollToBottom();
      }
    }
  }, [messages, scrollToBottomInstantly, scrollToBottom, userInfo.name]);

  // 검색 기능
  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results = messages
      .map((msg, index) => {
        if (msg.type === 'CHAT' && msg.content.toLowerCase().includes(query.toLowerCase())) {
          return index;
        }
        return null;
      })
      .filter(index => index !== null);

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0) {
      scrollToMessage(results[0]);
    }
  }, [messages]);

  // 메시지로 스크롤
  const scrollToMessage = useCallback((messageIndex) => {
    const messageElements = chatMessagesRef.current.children;
    if (messageElements[messageIndex]) {
      messageElements[messageIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElements[messageIndex].classList.add('highlight');
      setTimeout(() => {
        messageElements[messageIndex].classList.remove('highlight');
      }, 2000);
    }
  }, []);

  // 다음/이전 검색 결과로 이동
  const navigateSearch = useCallback((direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = currentSearchIndex - 1;
      if (newIndex < 0) newIndex = searchResults.length - 1;
    }

    setCurrentSearchIndex(newIndex);
    scrollToMessage(searchResults[newIndex]);
  }, [searchResults, currentSearchIndex, scrollToMessage]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isSearchOpen]);

  // 스크롤 위치 감지
  useEffect(() => {
    const chatMessages = chatMessagesRef.current;
    
    const handleScroll = () => {
      if (!chatMessages) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatMessages;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      
      // 맨 아래에서 300px 이상 올라왔을 때 버튼 표시
      setShowScrollButton(distanceFromBottom > 300);
    };

    // 초기 스크롤 상태 확인
    handleScroll();

    chatMessages?.addEventListener('scroll', handleScroll);
    
    // 새 메시지가 추가될 때마다 스크롤 상태 확인
    const observer = new MutationObserver(handleScroll);
    if (chatMessages) {
      observer.observe(chatMessages, { childList: true, subtree: true });
    }

    return () => {
      chatMessages?.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // 파일 전송 함수 추가
  const handleFileUpload = useCallback(async (file) => {

    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('sender', userInfo.name);


    try {
      const response = await fetch('/chat/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('업로드 실패:', errorData);
        throw new Error('파일 업로드 실패');
      }
      
      const fileData = await response.json();
      
      // 웹소켓으로 메시지 전송
      if (clientRef.current) {
        const messageData = {
          type: 'FILE',
          content: fileData.fileName,
          fileName: fileData.fileName,
          fileUrl: fileData.fileUrl,
          fileType: fileData.fileType,
          sender: userInfo.name,
          roomId: roomId,
          time: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, messageData]);

        await Promise.resolve(clientRef.current.publish({
          destination: `/app/chat.room/${roomId}/send`,
          body: JSON.stringify(messageData)
        }));
    
        setTimeout(async () => {
          await updateLastReadTime();
        }, 100);
      }

    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      alert('파일 업로드에 실패했습니다.');
    }
  }, [roomId, userInfo.name, updateLastReadTime]);

  const handleQuitRoom = useCallback(async () => {
    if (!window.confirm('정말로 채팅방을 나가시겠습니까?\n나간 채팅방의 메시지는 복구할 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/chat-rooms/${roomId}/quit/${userInfo.userIdx}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('채팅방 나가기 실패');
      }

      // 로컬 스토리지에서 해당 채팅방 메시지 삭제
      localStorage.removeItem(`chat-messages-${roomId}`);

      // 웹소켓 연결 해제
      if (clientRef.current) {
        clientRef.current.deactivate();
      }

      // 홈으로 이동
      navigate('/', { replace: true });
    } catch (error) {
      console.error('채팅방 나가기 중 오류:', error);
      alert('채팅방 나가기에 실패했습니다.');
    }
  }, [roomId, userInfo.userIdx, navigate]);

  useEffect(() => {
    if (!isActive) {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    }
  }, [isActive]);

  return {
    messages,
    participants,
    userListWidth,
    chatMessagesRef,
    handleMessageSubmit,
    handleMouseDown,
    navigate,
    onlineUsers,
    getUnreadCount,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    handleSearch,
    navigateSearch,
    searchResults,
    currentSearchIndex,
    showScrollButton,
    scrollToBottom,
    scrollToBottomInstantly,
    handleFileUpload,
    handleQuitRoom,
    readOnlyMode,
    isActive
  };
}

const ChatInputForm = React.memo(({ onSubmit, onFileUpload }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedFile)) return;
    
    onSubmit(inputMessage, selectedFile);
    setInputMessage('');
    setSelectedFile(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }
    
    await onFileUpload(file);
    e.target.value = ''; // 입력 초기화
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        className="chat-input"
        readOnly={selectedFile !== null}
      />
      <div className="chat-input-buttons">
        <label className="upload-button" title="파일 첨부">
          <FiPaperclip />
          <input 
            type="file" 
            hidden 
            onChange={handleFileChange}
          />
        </label>
        <label className="upload-button" title="이미지 첨부">
          <FiImage />
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={handleFileChange}
          />
        </label>
      </div>
      <button type="submit">전송</button>
    </form>
  );
});

const Message = ({ message, isMe, unreadCount }) => {
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // 다운로드 링크 생성
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName; // 원본 파일명으로 다운로드
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('파일 다운로드 중 오류:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case 'NOTIFICATION':
      case 'UNREAD_MARKER':
        return (
          <div className={`message-notification ${message.type.toLowerCase()}`}>
            {message.content}
          </div>
        );
      case 'CHAT':
        return <div className="message-content">{message.content}</div>;
      case 'FILE':
        return (
          <div className="message-file">
            {message.fileType.startsWith('image/') ? (
              // 이미지 클릭시 새 탭에서 열기
              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                <img src={message.fileUrl} alt={message.content} className="message-image" />
              </a>
            ) : (
              // 일반 파일은 클릭시 다운로드
              <div 
                className="file-download"
                onClick={() => handleDownload(message.fileUrl, message.content)}
                style={{ cursor: 'pointer' }}
              >
                📎 {message.content}
                <span className="download-icon">⬇️</span>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (message.type === 'NOTIFICATION' || message.type === 'UNREAD_MARKER') {
    return (
      <div className={`message system ${message.type.toLowerCase()}`}>
        {renderContent()}
        <div className="message-time">
          {new Date(message.time).toLocaleTimeString()}
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${isMe ? 'me' : 'other'}`}>
      {!isMe && <div className="message-sender">{message.sender}</div>}
      <div className="message-wrapper">
        {renderContent()}
        {unreadCount > 0 && (
          <span className="unread-count">{unreadCount}</span>
        )}
      </div>
      <div className="message-time">
        {new Date(message.time).toLocaleTimeString()}
      </div>
    </div>
  );
};

const ParticipantList = ({ participants, userInfo, onlineUsers }) => {
  return (
    <ul>
      {participants?.map(participant => {
        const isOnline = onlineUsers.has(String(participant.userIdx));
        return (
          <li 
            key={participant.userIdx}
            className={`
              ${participant.userIdx === userInfo.userIdx ? 'current-user' : ''}
              ${isOnline ? 'online' : 'offline'}
            `}
          >
            <span className="status-indicator"></span>
            <span className="participant-name">
              {participant.name}
              {participant.userIdx === userInfo.userIdx && ' (나)'}
              <small>
                {isOnline ? '온라인' : '오프라인'}
              </small>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

// 검색 컴포넌트
const SearchBar = ({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  onSearch,
  onNavigate,
  resultCount,
  currentIndex
}) => {
  if (!isOpen) return null;

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="메시지 검색..."
        autoFocus
      />
      {resultCount > 0 && (
        <div className="search-navigation">
          <span>{currentIndex + 1} / {resultCount}</span>
          <button onClick={() => onNavigate('prev')}>↑</button>
          <button onClick={() => onNavigate('next')}>↓</button>
        </div>
      )}
      <button className="close-search" onClick={onClose}>✕</button>
    </div>
  );
};


function ChatRoom({ userInfo }) {
  const {
    messages,
    participants,
    userListWidth,
    chatMessagesRef,
    handleMessageSubmit,
    handleMouseDown,
    navigate,
    onlineUsers,
    getUnreadCount,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    handleSearch,
    navigateSearch,
    searchResults,
    currentSearchIndex,
    showScrollButton,
    scrollToBottom,
    scrollToBottomInstantly,
    handleFileUpload,
    handleQuitRoom,
    readOnlyMode,
    isActive
  } = useChatRoom(userInfo);

  return (
    <div className="chat-container">
      {readOnlyMode && (
        <div className="read-only-banner">
          이 채팅방은 비활성화된 채팅방입니다. 메시지만 확인할 수 있습니다.
        </div>
      )}
      {!readOnlyMode && (
        <div className="user-list" style={{ width: userListWidth }}>
          <div className="resize-handle" onMouseDown={handleMouseDown}></div>
          <h3>
            채팅방 참여자 ({participants?.length || 0}) 
          </h3>
          <ParticipantList 
            participants={participants}
            userInfo={userInfo}
            onlineUsers={onlineUsers}
          />
        </div>
      )}
      <div className={`chat-room ${readOnlyMode ? 'full-width' : ''}`}>
        <div className="chat-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft /> 뒤로가기
          </button>
          <h2>채팅방</h2>
          <div className="header-buttons">
            <button 
              className="search-button" 
              onClick={() => setIsSearchOpen(true)}
              title="메시지 검색 (Ctrl+F)"
            >
              🔍
            </button>
            <button 
              className="quit-button"
              onClick={() => handleQuitRoom()}
              title="채팅방 나가기"
            >
              나가기
            </button>
          </div>
        </div>
        {isSearchOpen && (
          <SearchBar
            isOpen={isSearchOpen}
            onClose={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            onNavigate={navigateSearch}
            resultCount={searchResults.length}
            currentIndex={currentSearchIndex}
          />
        )}
        <div className="chat-messages-container">
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.map((message, index) => (
              <Message 
                key={index} 
                message={message} 
                isMe={message.sender === userInfo.name}
                unreadCount={getUnreadCount(message.time)}
              />
            ))}
          </div>
          {showScrollButton && (
            <button 
              className="scroll-to-bottom"
              onClick={() => scrollToBottom()}
              title="맨 아래로 이동"
            >
              ↓
            </button>
          )}
        </div>
        {!readOnlyMode && (
          <ChatInputForm 
            onSubmit={handleMessageSubmit} 
            onFileUpload={handleFileUpload} 
          />
        )}
      </div>
    </div>
  );
}

export default ChatRoom;