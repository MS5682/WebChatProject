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
  
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

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
                  sender: 'system',
                  time: new Date().toISOString()
                }]);
                fetchParticipants();
                break;
                
              case 'LEAVE':
                setMessages(prevMessages => [...prevMessages, {
                  type: 'NOTIFICATION',
                  content: `${receivedMessage.sender}님이 퇴장하셨습니다.`,
                  sender: 'system',
                  time: new Date().toISOString()
                }]);
                fetchParticipants();
                break;
                
              case 'CHAT':
                setMessages(prevMessages => [...prevMessages, receivedMessage]);
                break;
            }
          } catch (error) {
            console.error('메시지 처리 중 오류:', error);
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
  }, [roomId, fetchParticipants]);

  const handleMessageSubmit = useCallback(async (message, file) => {
    if (!clientRef.current?.connected) {
      console.error('WebSocket이 연결되어 있지 않습니다.');
      return;
    }

    try {
      let messageData = {
        type: 'CHAT',
        content: message,
        sender: userInfo.name,
        roomId: roomId,
        time: new Date().toISOString()
      };

      console.log('메시지 전송 시도:', messageData);
      clientRef.current.publish({
        destination: `/app/chat.room/${roomId}/send`,
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
    }
  }, [userInfo.name, roomId]);

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

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      const { scrollHeight, clientHeight } = chatMessagesRef.current;
      chatMessagesRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const initializeRoom = useCallback(async () => {
    try {
      if (userInfo?.name) {
        await connectWebSocket(userInfo.name);
      }
      
      await fetchParticipants();
      
    } catch (error) {
      console.error('채팅방 초기화 중 오류:', error);
    }
  }, [userInfo, connectWebSocket, fetchParticipants]);

  useEffect(() => {
    initializeRoom();
    
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [initializeRoom]);

  useEffect(() => {
    localStorage.setItem(`chat-messages-${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    messages,
    participants,
    userListWidth,
    chatMessagesRef,
    handleMessageSubmit,
    handleMouseDown,
    navigate,
    onlineUsers
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

const Message = ({ message, isMe }) => {
  const renderContent = () => {
    switch (message.type) {
      case 'NOTIFICATION':
        return (
          <div className="message-notification">
            {message.content}
          </div>
        );
      case 'CHAT':
      default:
        return <div className="message-content">{message.content}</div>;
    }
  };

  if (message.type === 'NOTIFICATION') {
    return (
      <div className="message system">
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
      {renderContent()}
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

function ChatRoom({ userInfo }) {
  const {
    messages,
    participants,
    userListWidth,
    chatMessagesRef,
    handleMessageSubmit,
    handleMouseDown,
    navigate,
    onlineUsers
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
          <span className="user-info"></span>
        </div>
        <div className="chat-messages" ref={chatMessagesRef}>
          {messages.map((message, index) => (
            <Message 
              key={index} 
              message={message} 
              isMe={message.sender === userInfo.name} 
            />
          ))}
        </div>
        <ChatInputForm onSubmit={handleMessageSubmit} />
      </div>
    </div>
  );
}

export default ChatRoom;