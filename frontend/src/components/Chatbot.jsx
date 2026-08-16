import { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../chatbotKnowledge';

function Chatbot({ caseContext }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I\'m the PanWatch assistant. Ask me about registration, verification, alerts, or your case status.' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If case context changes (e.g. user just got frozen), proactively explain why
  useEffect(() => {
    if (caseContext && caseContext.justUpdated) {
      const contextMsg = caseContext.verified
        ? 'Good news — your registration was just verified and continues normally.'
        : 'Your registration was just frozen because the face verification did not match closely enough. Ask me \"why flagged\" if you want more detail.';

      setMessages((prev) => [...prev, { sender: 'bot', text: contextMsg }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseContext]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    const botReply = { sender: 'bot', text: getChatbotResponse(input) };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '2rem auto',
      border: '1px solid #ddd',
      borderRadius: '10px',
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ backgroundColor: '#333', color: 'white', padding: '0.75rem 1rem', fontWeight: 'bold' }}>
        PanWatch Assistant
      </div>

      <div style={{ height: '300px', overflowY: 'auto', padding: '1rem', backgroundColor: '#fafafa' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              backgroundColor: msg.sender === 'user' ? '#3f8ee0' : '#e5e5ea',
              color: msg.sender === 'user' ? 'white' : 'black',
              maxWidth: '80%',
              fontSize: '0.9rem',
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your registration..."
          style={{ flex: 1, padding: '0.75rem', border: 'none', outline: 'none' }}
        />
        <button onClick={handleSend} style={{ padding: '0.75rem 1.25rem', border: 'none', backgroundColor: '#3f8ee0', color: 'white' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
