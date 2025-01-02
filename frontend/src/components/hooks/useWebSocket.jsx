import { useContext } from 'react';
import {WebSocketContext} from "../../context/WebSocketContext.jsx";

const useWebSocket = () => useContext(WebSocketContext);

export default useWebSocket;