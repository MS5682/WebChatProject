import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';
import Register from './components/Register';
import FindId from './components/FindId';
import FindPassword from './components/FindPassword';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="app">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/find-id" element={<FindId />} />
          <Route path="/find-password" element={<FindPassword />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
