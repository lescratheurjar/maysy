
const db = firebase.database();

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const rows = 20;
const cols = 20;
const cellSize = canvas.width / cols;
let maze = [];

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
    let unvisitedNeighbors = [];
    let dirs = [[0,-1],[1,0],[0,1],[-1,0]];

    for (let d of dirs) {
      let nx = current.x + d[0];
      let ny = current.y + d[1];
      let ni = index(nx, ny);
      if (ni !== -1 && !maze[ni].visited) {
        unvisitedNeighbors.push(maze[ni]);
      }
    }

    if (unvisitedNeighbors.length > 0) {
      let next = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
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

generateMaze();
