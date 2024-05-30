const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/cricket', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const MatchSchema = new mongoose.Schema({
  teamA: String,
  teamB: String,
  runs: [{
    over: Number,
    runs: Number,
    batsman: String,
    bowler: String
  }],
  totalRuns: { type: Map, of: Number }
});

const Match = mongoose.model('Match', MatchSchema);

app.use(express.json());

app.post('/match', async (req, res) => {
  const match = new Match(req.body);
  await match.save();
  res.send(match);
});

app.post('/match/:id/run', async (req, res) => {
  const { id } = req.params;
  const { over, runs, batsman, bowler } = req.body;
  const match = await Match.findById(id);
  match.runs.push({ over, runs, batsman, bowler });
  match.totalRuns.set(batsman, (match.totalRuns.get(batsman) || 0) + runs);
  await match.save();
  io.emit('update', match);
  res.send(match);
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Server started on port 4000'));
