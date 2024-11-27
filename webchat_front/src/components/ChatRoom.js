import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPaperclip, FiImage, FiArrowLeft } from 'react-icons/fi';
import '../styles/ChatRoom.css';

function useChatRoom(userInfo) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem(`chat-messages-${roomId}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
  const messagesEndRef = useRef(null);
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
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket 연결 성공');
        setIsConnected(true);
        
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
            const receivedMessage = JSON.parse(message.body);
            
            switch(receivedMessage.type) {
              case 'JOIN':
                setMessages(prevMessages => [...prevMessages, {
                  type: 'NOTIFICATION',
                  content: `${receivedMessage.sender}님이 입장하셨습니다.`,
                  sender: 'system'
                }]);
                fetchParticipants();
                break;
                
              case 'LEAVE':
                setMessages(prevMessages => [...prevMessages, {
                  type: 'NOTIFICATION',
                  content: `${receivedMessage.sender}님이 퇴장하셨습니다.`,
                  sender: 'system'
                }]);
                fetchParticipants();
                break;
                
              case 'CHAT':
                if (receivedMessage.sender !== userInfo.name) {
                  setMessages(prevMessages => [...prevMessages, receivedMessage]);
                  updateLastReadTime();
                }
                break;
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
        setIsConnected(false);
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
      setIsConnected(false);
    }
  }, [roomId, userInfo.name, updateLastReadTime]);

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

  const handleMouseDown = (e) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = userListWidth;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const diff = e.clientX - startX.current;
    const newWidth = Math.max(150, Math.min(400, startWidth.current + diff));
    setUserListWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const chatMessages = chatMessagesRef.current;
    if (chatMessages) {
      chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior
      });
    }
  }, []);

  const getUnreadCount = useCallback((messageTime) => {
    if (!participants || !lastReadTimes) return 0;
    
    return participants.reduce((count, participant) => {
      const lastReadTime = lastReadTimes[participant.userIdx];
      if (!lastReadTime || new Date(messageTime) > new Date(lastReadTime)) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [participants, lastReadTimes]);

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
      scrollToBottom();
      isFirstLoad.current = false;
    } else {
      const { scrollHeight, scrollTop, clientHeight } = chatMessagesRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      const lastMessage = messages[messages.length - 1];
      const isMyMessage = lastMessage?.sender === userInfo.name;

      if (isNearBottom || isMyMessage) {
        scrollToBottom();
      }
    }
  }, [messages]);

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
      newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    }

    setCurrentSearchIndex(newIndex);
    scrollToMessage(searchResults[newIndex]);
  }, [searchResults, currentSearchIndex, scrollToMessage]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    scrollToBottom
  };
}

const ChatInputForm = React.memo(({ onSubmit }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedFile)) return;
    
    onSubmit(inputMessage, selectedFile);
    setInputMessage('');
    setSelectedFile(null);
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
          <input type="file" hidden />
        </label>
        <label className="upload-button" title="이미지 첨부">
          <FiImage />
          <input type="file" accept="image/*" hidden />
        </label>
      </div>
      <button type="submit">전송</button>
    </form>
  );
});

const Message = ({ message, isMe, unreadCount }) => {
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
      default:
        return <div className="message-content">{message.content}</div>;
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

// 맨 아래로 이동 버튼 컴포넌트
const ScrollToBottomButton = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button 
      className="scroll-to-bottom"
      onClick={onClick}
      title="맨 아래로 이동"
    >
      ↓
    </button>
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
    scrollToBottom
  } = useChatRoom(userInfo);

  return (
    <div className="chat-container">
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
      <div className="chat-room">
        <div className="chat-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft /> 뒤로가기
          </button>
          <h2>채팅방</h2>
          <button 
            className="search-button" 
            onClick={() => setIsSearchOpen(true)}
            title="메시지 검색 (Ctrl+F)"
          >
            🔍
          </button>
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
        <ChatInputForm onSubmit={handleMessageSubmit} />
      </div>
    </div>
  );
}

export default ChatRoom;