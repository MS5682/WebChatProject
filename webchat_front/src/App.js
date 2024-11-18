import { useState, useEffect } from 'react';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log('Spring Boot 연결 확인');
    fetch('/api/hello')
      .then(response => {
        console.log('Spring Boot 응답 상태:', response.status);
        return response.text();
      })
      .then(data => {
        console.log('Spring Boot 받은 데이터:', data);
        setMessage(data);
      })
      .catch(error => {
        console.error('Spring Boot 에러 발생:', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>웹챗</h1>
      </header>
      <main>
        <ChatRoom />
      </main>
    </div>
  );
}

export default App;
