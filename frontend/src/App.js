import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    socket.on('update', (updatedMatch) => {
      setMatches((prevMatches) => 
        prevMatches.map(match => match._id === updatedMatch._id ? updatedMatch : match)
      );
    });

    return () => socket.off('update');
  }, []);

  return (
    <div className="App">
      <h1>Cricket Tournament Tracker</h1>
      {matches.map(match => (
        <div key={match._id}>
          <h2>{match.teamA} vs {match.teamB}</h2>
          <ul>
            {match.runs.map((run, index) => (
              <li key={index}>
                Over: {run.over}, Runs: {run.runs}, Batsman: {run.batsman}, Bowler: {run.bowler}
              </li>
            ))}
          </ul>
          <h3>Total Runs:</h3>
          <ul>
            {Array.from(match.totalRuns.entries()).map(([batsman, runs], index) => (
              <li key={index}>{batsman}: {runs} runs</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;


