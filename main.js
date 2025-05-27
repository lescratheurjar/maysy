const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const rows = 20;
const cols = 20;
const cellSize = canvas.width / cols;
let maze = [];

// Firebase Realtime Database
const db = firebase.database();
const playerId = Math.random().toString(36).substring(2, 10);
const playerRef = db.ref("players/" + playerId);

// Position de départ et couleur aléatoire
let player = { x: 0, y: 0, color: "#" + Math.floor(Math.random() * 16777215).toString(16) };

// Enregistrer joueur dans la DB
playerRef.set(player);
playerRef.onDisconnect().remove();

// Déplacement clavier
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
  drawMaze();
  drawPlayers();
});

// Génération du labyrinthe
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

    if (this.walls[0]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if (this.walls[1]) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (this.walls[2]) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y + cellSize);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
    if (this.walls[3]) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}

function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}

function generateMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      maze.push(new Cell(x, y));
    }
  }

  let stack = [];
  let current = maze[0];
  current.visited = true;

  function removeWalls(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 1) { a.walls[1] = false; b.walls[3] = false; }
    else if (dx === -1) { a.walls[3] = false; b.walls[1] = false; }
    if (dy === 1) { a.walls[2] = false; b.walls[0] = false; }
    else if (dy === -1) { a.walls[0] = false; b.walls[2] = false; }
  }

  function backtrack() {
    let unvisited = [];
    let dirs = [[0,-1],[1,0],[0,1],[-1,0]];
    for (let d of dirs) {
      let nx = current.x + d[0];
      let ny = current.y + d[1];
      let ni = index(nx, ny);
      if (ni !== -1 && !maze[ni].visited) {
        unvisited.push(maze[ni]);
      }
    }

    if (unvisited.length > 0) {
      let next = unvisited[Math.floor(Math.random() * unvisited.length)];
      stack.push(current);
      removeWalls(current, next);
      current = next;
      current.visited = true;
      setTimeout(backtrack, 10);
    } else if (stack.length > 0) {
      current = stack.pop();
      setTimeout(backtrack, 10);
    } else {
      drawMaze();
    }
  }

  backtrack();
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let cell of maze) {
    cell.draw();
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

generateMaze();
