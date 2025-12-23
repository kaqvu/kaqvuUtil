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

  return (
    <div style={{ padding: '20px' }}>
      <h1>kaqvuUtil</h1>
      
      <div>
        <h2>Online Players</h2>
        <ul>
          {players.map((player) => (
            <li
              key={player.uuid}
              onClick={() => setSelectedPlayer(player)}
              style={{
                cursor: 'pointer',
                background: selectedPlayer?.uuid === player.uuid ? '#ddd' : 'transparent',
                padding: '5px',
                margin: '5px 0'
              }}
            >
              {player.nick}
            </li>
          ))}
        </ul>
      </div>

      {selectedPlayer && (
        <div>
          <h2>Send to {selectedPlayer.nick}</h2>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ padding: '5px', width: '300px' }}
            />
            <button onClick={handleSendMessage} style={{ marginLeft: '5px', padding: '5px' }}>
              Send Message
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="Command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              style={{ padding: '5px', width: '300px' }}
            />
            <button onClick={handleSendCommand} style={{ marginLeft: '5px', padding: '5px' }}>
              Send Command
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
