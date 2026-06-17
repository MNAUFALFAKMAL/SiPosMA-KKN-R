"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useState(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="landing-page">
      <main>
        <div className={`big-wrapper ${isDark ? "dark" : "light"} ${isMenuOpen ? "active" : ""}`}>
          <img src="/img/shape.png" alt="Shape" className="shape" />

          <header>
            <div className="container">
              <div className="logo">
                <img src="/img/logo.jpg" alt="Logo" style={{ borderRadius: '50%' }} />
                <h3>SiPosMA</h3>
              </div>

              <div className="links">
                <ul>
                  <li><Link href="/">Beranda</Link></li>
                  <li><Link href="/dashboard" className="btn">Login</Link></li>
                </ul>
              </div>

              <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>

              <div className="hamburger-menu" onClick={toggleMenu}>
                <div className="bar"></div>
              </div>
            </div>
          </header>

          <div className="showcase-area">
            <div className="container">
              <div className="left">
                <div className="big-title">
                  <h1>Cegah Stunting,</h1>
                  <h1>itu Penting!</h1>
                </div>
                <p className="text">
                  Temukan informasi pertumbuhan yang lengkap, pantau perkembangan
                  mereka, dan bersama-sama kita menanamkan dasar masa depan yang
                  lebih sehat.
                </p>
                <div className="cta">
                  <Link href="/dashboard" className="btn">Get started</Link>
                </div>
              </div>

              <div className="right">
                <img src="/img/mama.png" alt="Product Image" className="product person" />
              </div>
            </div>
          </div>

          <div className="bottom-area">
            <div className="container">
              <button className="toggle-btn" onClick={toggleDarkMode}>
                <i className="far fa-moon"></i>
                <i className="far fa-sun"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
