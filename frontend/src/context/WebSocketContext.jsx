// WebSocketContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import Snake from '../classes/Snake';
// import sounds from "../components/utility/sounds/soundEffects.js";

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

    // play_collect: (data) => {
    //   sounds.collectPoint.play(undefined, false);
    // },
    //
    // correct_answer: (data) => {
    //   sounds.correctAnswer.play(undefined, false);
    // },
    //
    // wrong_answer: (data) => {
    //   sounds.wrongAnswer.play(undefined, false);
    // },

    session_broadcast: (data) => {
      // otherSnakes.current = data.players; // Speichert alle Schlangen

      // Entferne Schlangen, die nicht mehr in der Liste sind
      Object.keys(otherSnakes.current).forEach((snakeId) => {
        if (!data.players.some((player) => player.snakeId === snakeId)) {
          delete otherSnakes.current[snakeId];
        }
      });

      // Object.values(otherSnakes.current).forEach(snake => {
      //     snake.moveSnake(boundaries.current);
      // });

      data.players.forEach((player) => {
        if (otherSnakes.current[player.snakeId]) {
          otherSnakes.current[player.snakeId].update(player.headPosition,
              player.segments);
          otherSnakes.current[player.snakeId].updateScore(player.score);
          otherSnakes.current[player.snakeId].updateEquation(
              player.currentEquation);
          setCurrentEquation(player.currentEquation);
        } else {
          otherSnakes.current[player.snakeId] = new Snake(
              player.snakeId,
              player.headPosition.x,
              player.headPosition.y,
              {color: player.snakeId === playerSnakeId ? 'green' : 'red'}
          );
        }
      });

      // boundaries.current = data.boundaries; // Speichert die Spielfeldgrenzen
      food.current = data.food; // Speichert die Nahrung
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
    const socket = new WebSocket('wss://adder-backend.azurewebsites.net');

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
  }), [isReady, playerSnakeId, playerSnake, isSessionActive, sessionId,
    boundaries, food, currentEquation]);

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