// WebSocketContext.jsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import Snake from '../classes/Snake';
import {
  getSounds,
  initializeSounds
} from "../components/utility/sounds/soundEffects.js";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
  const [isReady, setIsReady] = useState(false);
  const [playerSnakeId, setPlayerSnakeId] = useState(null);
  const playerSnake = useRef(null);
  const otherSnakes = useRef({});
  const [isSessionActive, setIsSessionActive] = useState(false);
  const sessionId = useRef(null);
  const ws = useRef(null);
  const boundaries = useRef({});
  const food = useRef([]);
  const [currentEquation, setCurrentEquation] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const isSoundEnabledRef = useRef(isSoundEnabled);
  const soundsRef = useRef({});

  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  // Beispiel-Funktion zum Umschalten des Sounds
  useEffect(() => {
    setIsSoundEnabled(localStorage.getItem('isSoundEnabled') === 'true');
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem('isSoundEnabled', String(newState));
      return newState;
    });
  }, []);

  const activateAudio = useCallback(() => {
    initializeSounds();
    soundsRef.current = getSounds();
    setIsSoundEnabled(true);
  }, []);

  const messageHandlers = useRef({
    default: (data) => console.warn(`Unhandled message type: ${data.type}`,
        data),

    connect: (data) => {
      console.log('Connected, clientId:', data.payload.clientId);
    },

    session_joined: (data) => {
      const {initialGameState, snakeId} = data.payload;

      // Initialisiere alle Schlangen
      Object.values(initialGameState.players).forEach((player) => {
        otherSnakes.current[player.snakeId] = new Snake(player.snake);
      });

      sessionId.current = initialGameState.sessionId; // Speichert die Session-ID

      food.current = initialGameState.food; // Speichert die Nahrung
      boundaries.current = initialGameState.boundaries; // Speichert die Spielfeldgrenzen
      setCurrentEquation(
          initialGameState.players[snakeId].snake.currentEquation); // Speichert die aktuelle Aufgabe
      setPlayerSnakeId(snakeId); // Speichert die ID der eigenen Schlange
      setIsSessionActive(true);

      console.log(`Session joined! Snake ID: ${snakeId}`);
    },

    play_collect: (data) => {
      if (isSoundEnabledRef.current) {
        soundsRef.current.collectPoint.play(undefined, false);
      }
    },

    correct_answer: (data) => {
      const newEquation = data.payload.newEquation;
      setCurrentEquation(newEquation);
      if (isSoundEnabledRef.current) {
        soundsRef.current.correctAnswer.play(undefined, false);
      }
    },

    wrong_answer: (data) => {
      if (isSoundEnabledRef.current) {
        soundsRef.current.wrongAnswer.play(undefined, false);
      }
    },

    session_broadcast: (data) => {
      // Entferne Schlangen, die nicht mehr in der Liste sind
      Object.keys(otherSnakes.current).forEach((snakeId) => {
        if (!data.players.some((player) => player.snakeId === snakeId)) {
          delete otherSnakes.current[snakeId];
        }
      });

      data.players.forEach((player) => {
        const existingSnake = otherSnakes.current[player.snakeId];

        if (existingSnake) {
          // Nur aktualisieren, wenn sich etwas geändert hat
          existingSnake.updateDirection(player.direction);
          existingSnake.update(player.headPosition, player.segments);

          if (existingSnake.score !== player.score) {
            existingSnake.updateScore(player.score);
          }

        } else {
          // Neue Schlange hinzufügen
          otherSnakes.current[player.snakeId] = new Snake(player);
        }
      });

      // Nahrung nur aktualisieren, wenn sie sich verändert hat
      if (JSON.stringify(food.current) !== JSON.stringify(data.food)) {
        food.current = data.food;
      }
    },

    game_over: (data) => {
      setIsSessionActive(false);
      alert(`Game Over! Your score: ${data.score}`);
      console.log('Game over:', data);
    },

    error: (data) => {
      setIsSessionActive(false);
      alert(`Error: ${data.payload.message}`);
      console.log(`Error: ${data.payload.message}`);
    },

    session_started: () => {
      console.log('Session started');
      setIsSessionActive(true);
    },

    session_ended: () => {
      console.log('Session ended');
      setIsSessionActive(false);
    },
  });

  useEffect(() => {
    const socket = new WebSocket('ws://adder-backend.azurewebsites.net');

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsReady(true);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsReady(false);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log('Received message:', data);

      const handler = messageHandlers.current[data.type]
          || messageHandlers.current.default;
      try {
        handler(data); // Verarbeite die Nachricht
      } catch (error) {
        console.error(`Error handling message type "${data.type}":`, error);
      }
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []); // Nur einmal bei der Initialisierung ausführen

  const sendMessage = (msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket is not ready to send messages.');
    }
  };

  const value = useMemo(() => ({
    isReady,
    playerSnakeId,
    playerSnake,
    otherSnakes: otherSnakes.current,
    isSessionActive,
    sessionId,
    boundaries,
    food,
    currentEquation,
    sendMessage,
    toggleSound,
    isSoundEnabled,
    activateAudio,
  }), [isReady, playerSnakeId, isSessionActive, currentEquation, toggleSound, isSoundEnabled, activateAudio]);

  return (
      <WebSocketContext.Provider value={value}>
        {children}
      </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// export const useWebSocket = () => useContext(WebSocketContext);