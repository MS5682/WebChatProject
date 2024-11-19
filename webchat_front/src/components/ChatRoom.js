import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import '../styles/ChatRoom.css';
import { FiPaperclip, FiImage, FiFile } from 'react-icons/fi';  
import SockJS from 'sockjs-client';

// ChatInputForm을 별도의 컴포넌트로 분리하고 React.memo로 감싸기
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
          <input 
            type="file" 
            accept="image/*" 
            hidden 
          />
        </label>
      </div>
      <button type="submit">전송</button>
    </form>
  );
});

function ChatRoom() {
  // 상태 관리를 위한 state 선언
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [newMessage, setNewMessage] = useState(''); // 새로운 메시지 입력값
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('chat-username') || ''; // 로컬 스토리지에서 사용자명 가져오기
  });
  const [isConnected, setIsConnected] = useState(false); // WebSocket 연결 상태
  const clientRef = useRef(null); // WebSocket 클라이언트 참조
  const [activeUsers, setActiveUsers] = useState(new Set()); // 현재 접속중인 사용자 목록
  const [selectedFile, setSelectedFile] = useState(null);  // 선택된 파일 상태 추가
  const messagesEndRef = useRef(null);  // 스크롤을 위한 ref 추가


  // 컴포넌트 마운트 시 채팅 초기화
  useEffect(() => {
    const initializeChat = async () => {
      let currentUsername = username;
      
      // 사용자명이 없는 경우 입력 요청
      if (!currentUsername) {
        const userInput = prompt('채팅에 사용할 이름을 입력하세요:');
        if (userInput) {
          currentUsername = userInput;
          setUsername(userInput);
          localStorage.setItem('chat-username', userInput);
        }
      }

      if (currentUsername) {
        connectWebSocket(currentUsername);
      }
    };

    initializeChat();

    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [username]);

  // WebSocket 연결 설정
  const connectWebSocket = (user) => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      debug: function (str) {
        console.log('WebSocket Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected!');
        setIsConnected(true);
        
        // 구독 설정
        client.subscribe('/topic/public', (message) => {
          console.log('Received message:', message.body);
          
          try {
            const receivedMessage = JSON.parse(message.body);
            
            // 메시지 타입에 따른 처리
            switch(receivedMessage.type) {
              case 'JOIN':
                setMessages(prevMessages => [...prevMessages, {
                  type: 'NOTIFICATION',
                  content: `${receivedMessage.sender}님이 입장하셨습니다.`,
                  sender: 'system',
                  time: new Date().toISOString()
                }]);
                // 접속자 목록 업데이트
                if (receivedMessage.users) {
                  setActiveUsers(new Set(receivedMessage.users));
                }
                break;
                
              case 'LEAVE':
                setMessages(prevMessages => [...prevMessages, {
                  type: 'NOTIFICATION',
                  content: `${receivedMessage.sender}님이 퇴장하셨습니다.`,
                  sender: 'system',
                  time: new Date().toISOString()
                }]);
                // 접속자 목록 업데이트
                if (receivedMessage.users) {
                  setActiveUsers(new Set(receivedMessage.users));
                }
                break;

              case 'ACTIVE_USERS':
                // 활성 사용자 목록 업데이트
                if (receivedMessage.users) {
                  setActiveUsers(new Set(receivedMessage.users));
                }
                break;
                
              case 'CHAT':
                setMessages(prevMessages => [...prevMessages, receivedMessage]);
                break;
            }
          } catch (error) {
            console.error('메시지 처리 중 오류:', error);
          }
        });

        // 입장 메시지 발송
        client.publish({
          destination: '/app/chat.register',
          body: JSON.stringify({
            sender: user,
            type: 'JOIN',
            time: new Date().toISOString()
          })
        });

        // 현재 활성 사용자 목록 요청
        client.publish({
          destination: '/app/chat.activeUsers',
          body: JSON.stringify({})
        });
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected!');
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
      console.log('Attempting to connect...');
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
    }
  };

  const handleMessageSubmit = useCallback(async (message, file) => {
    if (!isConnected || !clientRef.current?.connected) {
      console.error('WebSocket이 연결되어 있지 않습니다.');
      return;
    }

    try {
      let messageData;
        
        messageData = {
          type: 'CHAT',
          content: message,
          sender: username,
          time: new Date().toISOString()
        };
        console.log('전송할 텍스트 메시지:', messageData);

      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
    }
  }, [isConnected, username]);


  // 페이지 종료 시 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (clientRef.current && isConnected) {
        clientRef.current.publish({
          destination: '/app/chat.leave',
          body: JSON.stringify({
            sender: username,
            type: 'LEAVE'
          })
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [username, isConnected]);

  // Message 컴포넌트 수정
  const Message = ({ message, isMe }) => {
    const renderContent = () => {
      console.log('Rendering message:', message);  // 렌더링되는 메시지 확인

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

    // 시스템 메시지는 다르게 스타일링
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

  // UI 렌더링
  return (
    <div className="chat-container">
      {/* 접속자 목록 영역 */}
      <div className="user-list">
        <h3>접속자 목록</h3>
        <ul>
          {[...activeUsers].map(user => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>
      {/* 채팅방 메인 영역 */}
      <div className="chat-room">
        <div className="chat-header">
          <h2>채팅방</h2>
          <span className="user-info">{username}</span>
        </div>
        {/* 메시지 표시 영역 */}
        <div className="chat-messages">
          {messages.map((message, index) => (
            <Message key={index} message={message} isMe={message.sender === username} />
          ))}
          <div ref={messagesEndRef} /> {/* 스크롤 위치를 위한 div 추가 */}
        </div>
        {/* 메시지 입력 폼 */}
        <ChatInputForm 
          onSubmit={handleMessageSubmit}
        />
      </div>
    </div>
  );
}

export default ChatRoom; 