// filepath: frontend/src/context/ScoreContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from 'react';
import PropTypes from 'prop-types';
export const ScoreContext = createContext();

export const ScoreProvider = ({children}) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async (gameType = '', username = '') => {
    try {
      const response = await fetch(
          `/api/leaderboard?gameType=${gameType}&username=${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setScores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const value = useMemo(() => ({scores, loading, error, fetchLeaderboard}),
      [scores, loading, error]);

  return (
      <ScoreContext.Provider value={value}>
        {children}
      </ScoreContext.Provider>
  );
};

ScoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useScores = () => useContext(ScoreContext);