<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Multiplayer Demo</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; background: #f0f0f0; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="600" height="600"></canvas>

  <!-- Firebase SDK -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
    import { getDatabase, ref, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAubP97xh0Irg-V257r6LrPIVqIn5w6Afc",
      authDomain: "maze-multiplayer.firebaseapp.com",
      projectId: "maze-multiplayer",
      databaseURL: "https://maze-multiplayer-default-rtdb.firebaseio.com",
      storageBucket: "maze-multiplayer.appspot.com",
      messagingSenderId: "710254402717",
      appId: "1:710254402717:web:07b2e4e7ee6fd7f02ec874",
      measurementId: "G-HRJ3T7Y63Y"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const playerId = Math.random().toString(36).substring(2, 10);
    const playerRef = ref(db, "players/" + playerId);

    const player = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16)
    };

    set(playerRef, player);
    onDisconnect(playerRef).remove();

    const allPlayers = {};

    onValue(ref(db, "players"), (snapshot) => {
      const data = snapshot.val() || {};
      for (let id in data) allPlayers[id] = data[id];
      draw();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") player.y -= 1;
      if (e.key === "ArrowDown") player.y += 1;
      if (e.key === "ArrowLeft") player.x -= 1;
      if (e.key === "ArrowRight") player.x += 1;
      set(playerRef, player);
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let id in allPlayers) {
        const p = allPlayers[id];
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * 30 + 15, p.y * 30 + 15, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  </script>
</body>
</html>
