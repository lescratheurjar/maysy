const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const rows = 20;
const cols = 20;
const cellSize = canvas.width / cols;
let maze = [];

const db = firebase.database();
const playerId = Math.random().toString(36).substring(2, 10);
const playerRef = db.ref("players/" + playerId);

let player = { x: 0, y: 0, color: "#" + Math.floor(Math.random() * 16777215).toString(16) };
playerRef.set(player);
playerRef.onDisconnect().remove();

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") player.y = Math.max(0, player.y - 1);
  else if (e.key === "ArrowDown") player.y = Math.min(rows - 1, player.y + 1);
  else if (e.key === "ArrowLeft") player.x = Math.max(0, player.x - 1);
  else if (e.key === "ArrowRight") player.x = Math.min(cols - 1, player.x + 1);
  playerRef.set(player);
});

let allPlayers = {};

db.ref("players").on("value", (snapshot) => {
  allPlayers = snapshot.val() || {};
  draw();
});

// --- Maze logic ---
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.walls = [true, true, true, true];
  }

  draw() {
    const x = this.x * cellSize;
    const y = this.y * cellSize;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    if (this.walls[0]) drawLine(x, y, x + cellSize, y);
    if (this.walls[1]) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
    if (this.walls[2]) drawLine(x + cellSize, y + cellSize, x, y + cellSize);
    if (this.walls[3]) drawLine(x, y + cellSize, x, y);
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}

function generateMaze() {
  maze = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      maze.push(new Cell(x, y));

  let stack = [];
  let current = maze[0];
  current.visited = true;

  function removeWalls(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (dx === 1) [a.walls[1], b.walls[3]] = [false, false];
    if (dx === -1) [a.walls[3], b.walls[1]] = [false, false];
    if (dy === 1) [a.walls[2], b.walls[0]] = [false, false];
    if (dy === -1) [a.walls[0], b.walls[2]] = [false, false];
  }

  let total = cols * rows - 1;
  while (total > 0) {
    let neighbors = [];
    let dirs = [[0,-1],[1,0],[0,1],[-1,0]];
    for (let [dx, dy] of dirs) {
      let nx = current.x + dx, ny = current.y + dy;
      let ni = index(nx, ny);
      if (ni !== -1 && !maze[ni].visited) neighbors.push(maze[ni]);
    }

    if (neighbors.length > 0) {
      let next = neighbors[Math.floor(Math.random() * neighbors.length)];
      stack.push(current);
      removeWalls(current, next);
      current = next;
      current.visited = true;
      total--;
    } else {
      current = stack.pop();
    }
  }
}

function drawPlayers() {
  for (let id in allPlayers) {
    const p = allPlayers[id];
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(
      p.x * cellSize + cellSize / 2,
      p.y * cellSize + cellSize / 2,
      cellSize / 3,
      0, Math.PI * 2
    );
    ctx.fill();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let cell of maze) cell.draw();
  drawPlayers();
}

generateMaze();
draw();
