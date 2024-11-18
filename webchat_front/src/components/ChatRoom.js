// 필요한 라이브러리와 스타일 import
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import '../styles/ChatRoom.css';

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
      reconnectDelay: 5000,      // 연결이 끊어졌을 때 재연결을 시도하는 간격 (밀리초)
      heartbeatIncoming: 4000,   // 서버로부터 heartbeat를 기다리는 시간 간격 (밀리초)
      heartbeatOutgoing: 4000,   // 서버로 heartbeat를 보내는 시간 간격 (밀리초)
    });

    // WebSocket 연결 성공 시 실행
    client.onConnect = (frame) => {
      console.log('WebSocket Connected!');
      setIsConnected(true);
      
      // 공개 채널 구독
      client.subscribe('/topic/public', (message) => {
        console.log('Received message:', message);
        const receivedMessage = JSON.parse(message.body);
        
        // 메시지 타입에 따른 처리
        switch(receivedMessage.type) {
          case 'JOIN':
            setActiveUsers(prev => new Set([...prev, receivedMessage.sender]));
            break;
          case 'LEAVE':
            setActiveUsers(prev => {
              const newUsers = new Set(prev);
              newUsers.delete(receivedMessage.sender);
              return newUsers;
            });
            break;
          case 'ACTIVE_USERS':
            // 서버로부터 받은 사용자 목록으로 activeUsers를 업데이트
            if (Array.isArray(receivedMessage.users)) {
              console.log('Received active users:', receivedMessage.users);
              setActiveUsers(new Set(receivedMessage.users));
            }
            break;
        }
        
        // ACTIVE_USERS 타입일 때는 메시지 목록에 추가하지 않음
        if (receivedMessage.type !== 'ACTIVE_USERS') {
          setMessages(prevMessages => [...prevMessages, receivedMessage]);
        }
      });

      // 사용자 입장 메시지 발행
      client.publish({
        destination: '/app/chat.register',
        body: JSON.stringify({
          sender: user,
          type: 'JOIN'
        })
      });

      // 현재 활성 사용자 목록 요청
      client.publish({
        destination: '/app/chat.activeUsers',
        body: JSON.stringify({
          sender: user,
          type: 'GET_ACTIVE_USERS'
        })
      });
    };

    // WebSocket 연결 해제 시 실행
    client.onDisconnect = () => {
      console.log('WebSocket Disconnected!');
      setIsConnected(false);
    };

    // WebSocket 연결 시도
    try {
      console.log('Attempting to connect...');
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
    }
  };

  // 메시지 전송 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit button clicked');

    if (!newMessage.trim()) {
        console.log('Message is empty');
        return;
    }

    if (!isConnected) {
        console.log('Not connected to WebSocket');
        return;
    }

    const messageData = {
        content: newMessage,
        sender: username,
        type: 'CHAT',
        time: new Date().toISOString()
    };

    console.log('Message Data:', messageData);

    try {
        clientRef.current.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(messageData)
        });
        console.log('Message sent successfully');
        setNewMessage('');
    } catch (error) {
        console.error('Error sending message:', error);
    }
  };

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
            <div key={index} 
                 className={`message ${message.sender === username ? 'me' : 'other'}`}>
              {message.sender !== username && (
                <div className="message-sender">{message.sender}</div>
              )}
              <div className="message-content">
                {message.content || message.text}
              </div>
              <div className="message-time">
                {new Date(message.time).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
        {/* 메시지 입력 폼 */}
        <form 
          className="chat-input-form" 
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
            placeholder="메시지를 입력하세요..."
            className="chat-input"
          />
          <button 
            type="submit" 
            className="send-button"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom; 