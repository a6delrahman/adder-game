// WebSocketContext.jsx
import {
  createContext,
  useCallback,
  useContext,
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
  const isSoundEnabledRef = useRef(false);
  const soundsRef = useRef({});

  // Beispiel-Funktion zum Umschalten des Sounds
  useEffect(() => {
    isSoundEnabledRef.current = localStorage.getItem('isSoundEnabled')
        === 'true';
  }, []);

  const toggleSound = useCallback(() => {
    isSoundEnabledRef.current = !isSoundEnabledRef.current;
    localStorage.setItem('isSoundEnabled', String(isSoundEnabledRef.current));
    return isSoundEnabledRef.current;
  }, []);

  const activateAudio = useCallback(() => {
    initializeSounds();
    soundsRef.current = getSounds();
    isSoundEnabledRef.current = true;
  }, []);

  const messageHandlers = useRef({
    default: (data) => console.warn(`Unhandled message type: ${data.type}`,
        data),

    connect: (data) => {
      console.log('Connected, clientId:', data.payload.clientId);
    },

    session_joined: (data) => {
      const {initialGameState, snakeId} = data.payload;
      // const {players, food, boundaries} = initialGameState;

      // Initialisiere alle Schlangen
      Object.values(initialGameState.players).forEach((player) => {
        otherSnakes.current[player.snakeId] = new Snake(player.snake);
      });

      // playerSnake.current = data.playerState; // Speichert die eigene Schlange
      sessionId.current = initialGameState.sessionId; // Speichert die Session-ID

      food.current = initialGameState.food; // Speichert die Nahrung
      boundaries.current = initialGameState.boundaries; // Speichert die Spielfeldgrenzen
      setCurrentEquation(
          initialGameState.players[snakeId].snake.currentEquation); // Speichert die aktuelle Aufgabe
      setPlayerSnakeId(snakeId); // Speichert die ID der eigenen Schlange
      setIsSessionActive(true);

      console.log(`Session joined! Snake ID: ${snakeId}`);
    },

    snake_id: (data) => {
      console.log('Snake ID received:', data.snakeId);
      // setPlayerSnake({ snakeId: data.snakeId, sessionId }); // Neu: Bezieht sessionId
    },

    play_collect: (data) => {
      if (isSoundEnabledRef.current) {
        soundsRef.current.collectPoint.play(undefined, false);
      }
    },

    correct_answer: (data) => {
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

      // data.players.forEach((player) => {
      //   if (otherSnakes.current[player.snakeId]) {
      //     otherSnakes.current[player.snakeId].update(player.headPosition,
      //         player.segments);
      //     otherSnakes.current[player.snakeId].updateScore(player.score);
      //     otherSnakes.current[player.snakeId].updateDirection(player.direction);
      //     otherSnakes.current[player.snakeId].updateEquation(
      //         player.currentEquation);
      //     setCurrentEquation(player.currentEquation);
      //   } else {
      //     otherSnakes.current[player.snakeId] = new Snake(
      //         player);
      //   }
      // });
      // food.current = data.food; // Speichert die Nahrung

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

    update_equation: (data) => {
      otherSnakes[playerSnakeId].currentEquation = data.currentEquation;
      console.log('update_equation:', data);
    },

    remove_player: (data) => {
      console.log('Player removed:', data.snakeId);
      setOtherSnakes((prev) => {
        const updated = {...prev};
        delete updated[data.snakeId];
        return updated;
      });
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
    const socket = new WebSocket('ws://localhost:5000/');

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
    isSoundEnabled: isSoundEnabledRef.current,
    activateAudio,
  }), [isReady, playerSnakeId, playerSnake, isSessionActive, sessionId,
    boundaries, food, currentEquation, toggleSound]);

  return (
      <WebSocketContext.Provider value={value}>
        {children}
      </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useWebSocket = () => useContext(WebSocketContext);