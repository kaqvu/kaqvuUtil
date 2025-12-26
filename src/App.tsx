import { useState, useEffect, useCallback } from 'react';

interface Player {
  uuid: string;
  nick: string;
  lastSeen: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [message, setMessage] = useState('');
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('kaqvu_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data.players);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching players:', error);
        setIsLoading(false);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = useCallback(() => {
    if (loginInput === 'kaqvu' && passwordInput === 'k11pspro') {
      setIsLoggedIn(true);
      localStorage.setItem('kaqvu_logged_in', 'true');
      setLoginError('');
    } else {
      setLoginError('Nieprawidłowy login lub hasło!');
    }
  }, [loginInput, passwordInput]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem('kaqvu_logged_in');
    setSelectedPlayer(null);
    setPlayers([]);
    setIsLoading(true);
  }, []);

  const handleSendMessage = useCallback(async () => {
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
  }, [selectedPlayer, message]);

  const handleSendCommand = useCallback(async () => {
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
  }, [selectedPlayer, command]);

  const handleDisconnect = useCallback(async () => {
    if (!selectedPlayer) return;

    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: selectedPlayer.uuid,
          type: 'disconnect',
          content: 'Disconnected'
        })
      });
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error disconnecting player:', error);
    }
  }, [selectedPlayer]);

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'VT323', monospace"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            background: #0a0a0a;
          }

          @keyframes glow {
            0%, 100% { text-shadow: 0 0 20px rgba(0, 255, 0, 0.5), 0 0 30px rgba(0, 255, 0, 0.3); }
            50% { text-shadow: 0 0 30px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.5); }
          }

          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.3); }
            50% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.6); }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div style={{
          background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
          border: '2px solid #00ff00',
          borderRadius: '10px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          margin: '20px',
          boxShadow: '0 10px 40px rgba(0, 255, 0, 0.3)',
          animation: 'slideIn 0.5s ease'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '30px',
            animation: 'glow 2s ease-in-out infinite',
            letterSpacing: '2px'
          }}>
            kaqvuUtil
          </h1>

          <div>
            <input
              type="text"
              placeholder="Login"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                background: '#1a1a1a',
                border: '2px solid #2a2a2a',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '1.4rem',
                fontFamily: "'VT323', monospace",
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00ff00'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />

            <input
              type="password"
              placeholder="Hasło"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                background: '#1a1a1a',
                border: '2px solid #2a2a2a',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '1.4rem',
                fontFamily: "'VT323', monospace",
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00ff00'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />

            {loginError && (
              <div style={{
                color: '#ff0000',
                fontSize: '1.3rem',
                textAlign: 'center',
                marginBottom: '15px',
                textShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
              }}>
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(145deg, #00cc00, #009900)',
                border: '2px solid #00ff00',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '1.6rem',
                fontFamily: "'VT323', monospace",
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'pulse 2s ease-in-out infinite',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #00ff00, #00cc00)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #00cc00, #009900)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ZALOGUJ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'VT323', monospace"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            background: #0a0a0a;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes glow {
            0%, 100% { text-shadow: 0 0 20px rgba(0, 255, 0, 0.5), 0 0 30px rgba(0, 255, 0, 0.3); }
            50% { text-shadow: 0 0 30px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.5); }
          }
        `}</style>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid #1a1a1a',
            borderTop: '4px solid #00ff00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 30px'
          }}></div>
          <div style={{
            fontSize: '2.5rem',
            color: '#ffffff',
            animation: 'glow 2s ease-in-out infinite'
          }}>
            Ładowanie...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e0e0e0',
      fontFamily: "'VT323', monospace",
      paddingBottom: '40px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: #0a0a0a;
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
          50% { text-shadow: 0 0 30px rgba(0, 255, 0, 0.8); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus {
          border-color: #00ff00 !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
        }

        button:hover {
          transform: translateY(-2px) !important;
        }

        button:active {
          transform: translateY(0) !important;
        }

		::placeholder {
          color: #666666;
        }

        .logout-btn {
          position: absolute;
          top: 20px;
          right: 20px;
        }

        @media (max-width: 768px) {
          .logout-btn {
            font-size: 1.1rem !important;
            padding: 8px 15px !important;
            top: 15px;
            right: 15px;
          }
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderBottom: '2px solid #2a2a2a',
        padding: '40px 20px',
        position: 'relative'
      }}>
		<button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            background: 'linear-gradient(145deg, #cc0000, #990000)',
            border: '2px solid #ff0000',
            borderRadius: '5px',
            color: '#ffffff',
            fontSize: '1.3rem',
            fontFamily: "'VT323', monospace",
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(145deg, #ff0000, #cc0000)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(145deg, #cc0000, #990000)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          WYLOGUJ
        </button>

        <h1 style={{
          fontSize: '4rem',
          color: '#ffffff',
          textAlign: 'center',
          animation: 'glow 2s ease-in-out infinite',
          letterSpacing: '2px',
          margin: 0
        }}>
          kaqvuUtil
        </h1>
      </div>

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
          border: '2px solid #2a2a2a',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '40px',
          transition: 'all 0.3s ease',
          animation: 'fadeIn 0.5s ease'
        }}>
          <h2 style={{
            fontSize: '3rem',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '30px',
            textShadow: '0 0 15px rgba(0, 255, 0, 0.4)'
          }}>
            Gracze Online {players.length > 0 && `(${players.length})`}
          </h2>

          {players.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#888888',
              fontSize: '1.5rem',
              padding: '40px'
            }}>
              Brak graczy online
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {players.map((player) => (
                <div
                  key={player.uuid}
                  onClick={() => setSelectedPlayer(player)}
                  style={{
                    padding: '20px',
                    background: selectedPlayer?.uuid === player.uuid
                      ? 'linear-gradient(145deg, #00cc00, #009900)'
                      : 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                    border: selectedPlayer?.uuid === player.uuid
                      ? '2px solid #00ff00'
                      : '2px solid #2a2a2a',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = '#00ff00';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 255, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    if (selectedPlayer?.uuid !== player.uuid) {
                      e.currentTarget.style.borderColor = '#2a2a2a';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {player.nick}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPlayer && (
          <div style={{
            background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
            border: '2px solid #2a2a2a',
            borderRadius: '10px',
            padding: '30px',
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.5s ease'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '30px',
              textShadow: '0 0 15px rgba(0, 255, 0, 0.4)'
            }}>
              Sterowanie: {selectedPlayer.nick}
            </h2>

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Wpisz wiadomość..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: '#1a1a1a',
                  border: '2px solid #2a2a2a',
                  borderRadius: '5px',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontFamily: "'VT323', monospace",
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(145deg, #00cc00, #009900)',
                  border: '2px solid #00ff00',
                  borderRadius: '5px',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontFamily: "'VT323', monospace",
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #00ff00, #00cc00)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 255, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #00cc00, #009900)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                WYŚLIJ
              </button>
            </div>

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Wpisz komendę..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: '#1a1a1a',
                  border: '2px solid #2a2a2a',
                  borderRadius: '5px',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontFamily: "'VT323', monospace",
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleSendCommand}
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(145deg, #00cc00, #009900)',
                  border: '2px solid #00ff00',
                  borderRadius: '5px',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontFamily: "'VT323', monospace",
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #00ff00, #00cc00)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 255, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #00cc00, #009900)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                WYŚLIJ
              </button>
            </div>

            <button
              onClick={handleDisconnect}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(145deg, #cc0000, #990000)',
                border: '2px solid #ff0000',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontFamily: "'VT323', monospace",
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #ff0000, #cc0000)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #cc0000, #990000)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ROZŁĄCZ GRACZA
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;