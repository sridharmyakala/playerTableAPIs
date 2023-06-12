const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

initializeDBAndServer();
app.get("/players", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;
    `;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(
    dbResponse.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// Create a New Player API
app.post("/players/", async (request, response) => {
  const requestBody = request.body;
  const { PlayerName, jerseyNumber, role } = requestBody;
  const createPlayerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES ('${PlayerName}', ${jerseyNumber}, '${role}');`;
  await db.run(createPlayerQuery);
  response.send("Player Added to Team");
});

// Get player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `;
  const dbResponse = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

// Update player API
app.put("/players/:playerId/", async (request, response) => {
  const requestBody = request.body;
  const { playerName, jerseyNumber, role } = requestBody;
  const { playerId } = request.params;
  const updatePlayerQuery = `
    UPDATE cricket_team SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}'
    WHERE player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Delete player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
