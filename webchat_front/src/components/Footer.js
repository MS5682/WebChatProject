import React from 'react';

import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <p className="copyright">© 2024 MS5682. All rights reserved.</p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h3>서비스</h3>
            <a href="#" className="footer-link">기능 소개</a>
            <a href="#" className="footer-link">요금제</a>
            <a href="#" className="footer-link">FAQ</a>
          </div>

          <div className="footer-section">
            <h3>고객지원</h3>
            <a href="#" className="footer-link">문의하기</a>
            <a href="#" className="footer-link">이용약관</a>
            <a href="#" className="footer-link">개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer; 