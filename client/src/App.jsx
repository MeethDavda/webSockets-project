import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
let player1 = false;

function App() {
  const [id, setId] = useState();
  const [wait, setWait] = useState(null);
  const [choice, setChoice] = useState();
  const [winner, setWinner] = useState();

  var socket = io("http://localhost:5000/", { transports: ["websocket"] });
  function createGame() {
    player1 = true;
    socket.emit("createGame");
  }
  function joinGame() {
    socket.emit("joinGame", { roomId: id });
  }

  function sendChoice(data) {
    const choiceEvent = player1 ? "p1Choice" : "p2Choice";
    // console.log(player1, data);
    socket.emit(choiceEvent, {
      rpsValue: data,
      roomId: id,
    });
  }

  useEffect(() => {
    socket.on("newGame", (data) => {
      const iden = data.roomId;
      setId(iden);
      setWait(`waiting for player, share code ${iden}`);
      document.getElementById("main").style.display = "none";
    });

    socket.on("playersConnected", () => {
      // console.log("helo");
      document.getElementById("main").style.display = "none";
      setWait(null);
    });

    socket.on("p1Choice", () => {
      if (!player1) {
        setChoice("Opponent has made choice");
      }
    });

    socket.on("p2Choice", () => {
      if (player1) {
        setChoice("Opponent has made choice");
      }
    });

    socket.on("result", (res) => {
      setWinner(res.winner);
    });
  }, [socket]);

  return (
    <div>
      Hello to rock paper scissors
      <div>
        <div id="main">
          <button onClick={createGame}>Create game</button>
          <div>OR</div>
          <div>
            <input type="text" onChange={(e) => setId(e.target.value)} />
            <button onClick={joinGame}>Join Game</button>
          </div>
        </div>
        <div>
          {wait ? <div id="waitingArea">{wait}</div> : null}
          {!wait ? (
            <div id="gameArea">
              <button onClick={() => sendChoice("rock")}>Rock</button>
              <button onClick={() => sendChoice("paper")}>Paper</button>
              <button onClick={() => sendChoice("scissors")}>Scissors</button>
              {!choice ? (
                <div id="winnerArea">waiting for opponents choice</div>
              ) : (
                <div id="winnerArea">{choice}</div>
              )}
              {winner ? <div>Winner is {winner}</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
