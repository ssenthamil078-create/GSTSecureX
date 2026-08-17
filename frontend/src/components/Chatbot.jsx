import { useState, useRef, useEffect } from 'react';
import { Bot, FileText, ShieldCheck, Bell, Search, Send } from 'lucide-react';
import { getChatbotResponse } from '../chatbotKnowledge';
import './../chatTheme.css';

const CHIPS = [
  { icon: FileText, color: 'var(--green)', bg: 'var(--green-soft)', label: 'Registration Process', prompt: 'what is GST registration' },
  { icon: ShieldCheck, color: 'var(--blue)', bg: 'var(--blue-soft)', label: 'Verification Steps', prompt: 'how does verification work' },
  { icon: Bell, color: 'var(--amber)', bg: 'var(--amber-soft)', label: 'Recent Alerts', prompt: 'how does the alert work' },
  { icon: Search, color: 'var(--purple)', bg: 'var(--purple-soft)', label: 'Check Case Status', prompt: 'what is my status' },
];

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Chatbot({ caseContext }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi 👋 I\'m the GSTSecureX assistant. Ask me about registration, verification, alerts, or your case status.', time: formatTime() },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (caseContext && caseContext.justUpdated) {
      const contextMsg = caseContext.verified
        ? 'Good news — your registration was just verified and continues normally.'
        : 'Your registration was just frozen because the face verification did not match closely enough. Ask me "why was I flagged" if you want more detail.';
      setMessages((prev) => [...prev, { sender: 'bot', text: contextMsg, time: formatTime() }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseContext]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user', text, time: formatTime() };
    const botReply = { sender: 'bot', text: getChatbotResponse(text, caseContext), time: formatTime() };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput('');
  };

  const handleSend = () => sendMessage(input);
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSend(); };
  const handleChip = (prompt) => sendMessage(prompt);

  return (
    <div className="pw-chat-wrap">
      <div className="pw-page-title" style={{ fontSize: '1.3rem' }}>Assistant</div>
      <div className="pw-page-subtitle">Ask questions about your registration in plain language</div>

      <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={'pw-chat-row ' + (msg.sender === 'user' ? 'user' : '')}>
            {msg.sender === 'bot' && (
              <div className="pw-chat-avatar"><Bot size={22} color="var(--green)" /></div>
            )}
            <div className={'pw-chat-bubble ' + (msg.sender === 'user' ? 'user' : '')}>
              {msg.sender === 'bot' && idx === 0 ? (
                <>Hi 👋<br />I'm the <strong style={{ color: 'var(--green)' }}>GSTSecureX</strong> assistant. Ask me about registration, verification, alerts, or your case status.</>
              ) : msg.text}
              <span className="pw-chat-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="pw-chat-chips">
        {CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.label}
              className="pw-chat-chip"
              style={{ background: chip.bg, borderColor: chip.color + '33', color: 'var(--ink)' }}
              onClick={() => handleChip(chip.prompt)}
            >
              <span className="pw-chat-chip-icon"><Icon size={18} color={chip.color} /></span>
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="pw-chat-inputbar">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your registration..."
        />
        <button className="pw-chat-send" onClick={handleSend}>
          <Send size={15} /> Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
