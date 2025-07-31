import "./App.css";

import ChatWidget from "./components/ChatWidget"; // 👈 Import the new component

function App() {
  return (
    <>
      <div>
        <a href="https://mieweb.org" target="_blank" rel="noreferrer">
          <img
            src="https://mieweb.org/wp-content/uploads/2024/04/mie-logo-white.svg"
            className="logo"
            alt="MIE Logo"
          />
        </a>
      </div>
      <h1>MIE Healthcare Solutions</h1>
      <div className="card">
        <p>Welcome to MIE. How can we help you today?</p>
      </div>
      <p className="read-the-docs">
        Solutions that make a meaningful difference in healthcare.
      </p>

      {/* ✅ Render ChatBotWidget */}
      <ChatWidget />
    </>
  );
}

export default App;
