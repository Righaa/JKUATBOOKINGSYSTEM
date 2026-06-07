import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const WELCOME_TEXT = "Welcome to JKUAT APPOINTMENT BOOKING SYSTEM";
const TYPING_SPEED_MS = 55;

export default function Home() {
  const [displayText, setDisplayText] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      index += 1;
      setDisplayText(WELCOME_TEXT.slice(0, index));

      if (index >= WELCOME_TEXT.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="public-home">
      <h1 className="public-welcome-title">
        <span className="typing-text">{displayText}</span>
        {!typingDone && <span className="typing-cursor" aria-hidden="true" />}
      </h1>

      <p className={`public-subtitle ${typingDone ? "public-subtitle-visible" : ""}`}>
        Book appointments, manage doctors, and track your hospital visits online.
      </p>

      <div className={`public-actions ${typingDone ? "public-actions-visible" : ""}`}>
        <Link to="/login" className="public-btn public-btn-primary">
          Patient Login
        </Link>
        <Link to="/register" className="public-btn public-btn-secondary">
          Register
        </Link>
        <Link to="/doctor/login" className="public-btn public-btn-secondary">
          Doctor Portal
        </Link>
      </div>
    </div>
  );
}
