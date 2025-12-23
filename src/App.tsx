import { useState, useEffect } from 'react';

interface Player {
  uuid: string;
  nick: string;
  lastSeen: number;
}

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [message, setMessage] = useState('');
  const [command, setCommand] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data.players);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!selectedPlayer || !message) return;

    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: selectedPlayer.uuid,
          type: 'message',
          content: message
        })
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendCommand = async () => {
    if (!selectedPlayer || !command) return;

    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: selectedPlayer.uuid,
          type: 'command',
          content: command
        })
      });
      setCommand('');
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    color: '#fff',
    padding: '40px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '40px',
    textShadow: '0 0 30px rgba(102, 126, 234, 0.5)'
  };

  const sectionStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto 40px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#b8b8ff'
  };

  const playersListStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px'
  };

  const getPlayerStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '15px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    background: isSelected 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.08)',
    border: isSelected
      ? '2px solid rgba(102, 126, 234, 0.8)'
      : '2px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'scale(1)',
    boxShadow: isSelected
      ? '0 0 30px rgba(102, 126, 234, 0.6), 0 8px 16px rgba(0, 0, 0, 0.3)'
      : '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '16px'
  });

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    width: 'calc(100% - 140px)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    marginRight: '10px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  };

  const inputContainerStyle: React.CSSProperties = {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
        }

        input:focus {
          border-color: rgba(102, 126, 234, 0.6) !important;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        button:active {
          transform: translateY(0);
        }

        li:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 0 25px rgba(102, 126, 234, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3) !important;
        }

        ::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>

      <h1 style={headerStyle}>kaqvuUtil</h1>
      
      <div style={sectionStyle}>
        <h2 style={subtitleStyle}>Online Players {players.length > 0 && `(${players.length})`}</h2>
        {players.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '20px' }}>
            No players online
          </div>
        ) : (
          <ul style={playersListStyle}>
            {players.map((player) => (
              <li
                key={player.uuid}
                onClick={() => setSelectedPlayer(player)}
                style={getPlayerStyle(selectedPlayer?.uuid === player.uuid)}
              >
                {player.nick}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPlayer && (
        <div style={sectionStyle}>
          <h2 style={subtitleStyle}>Send to {selectedPlayer.nick}</h2>
          
          <div style={inputContainerStyle}>
            <input
              type="text"
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={inputStyle}
            />
            <button onClick={handleSendMessage} style={buttonStyle}>
              Send Message
            </button>
          </div>

          <div style={inputContainerStyle}>
            <input
              type="text"
              placeholder="Type command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
              style={inputStyle}
            />
            <button onClick={handleSendCommand} style={buttonStyle}>
              Send Command
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
