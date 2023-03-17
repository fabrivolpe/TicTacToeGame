let originalBoard;
const playersButtons = document.getElementsByClassName("players-button");
const playerSelection = document.querySelector(".choose-players");
const difficultySelection = document.querySelector(".difficulty");
const difficultyButtons = document.getElementsByClassName("difficulty-button");
const title = document.querySelector(".game h1");
const gameSection = document.querySelector(".game");
const humanPlayer = "X";
const aiPlayer = "O";
const player1 = "X";
const player2 = "O";
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];

const cells = document.querySelectorAll(".cell");
let mode;
let difficulty;

//Pick single or multiplayer
for (const button of playersButtons) {
    button.addEventListener("click", function () {
        mode = button.id;
        if (mode == "single") {
            playerSelection.style.display = "none";
            difficultySelection.style.display = "block";
        } else {
            playerSelection.style.display = "none";
            difficultySelection.style.display = "none";
            gameSection.style.display = "block";
            title.innerText = "Multiplayer";
            startMultiplayerGame();
        }
    });
}

//Pick difficulty
for (const button of difficultyButtons) {
    button.addEventListener("click", function () {
        difficulty = button.id;
        console.log(difficulty);
        title.innerText = button.innerText;
    });
}

function pickDifficulty() {
    difficultySelection.style.display = "none";
    gameSection.style.display = "block";
    startGame();
}

//Single player
function startGame() {
    document.querySelector(".endgame").style.display = "none";
    document.querySelector(".multiplayer-endgame").style.display = "none";
    document.querySelector(".main-menu").style.display = "block";
    originalBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = "";
        cells[i].style.removeProperty("background-color");
        cells[i].addEventListener("click", turnClick, false);
    }
}

function turnClick(square) {
    if (typeof (originalBoard[square.target.id] == "number")) {
        turn(square.target.id, humanPlayer);
        if (!checkWin(originalBoard, humanPlayer)) {
            if (!checkTie()) turn(bestSpot(), aiPlayer);
        }
    }
}

function turn(squareId, player) {
    originalBoard[squareId] = player;
    if (document.getElementById(squareId).innerText === "") {
        cells[squareId].removeEventListener("click", turnClick, false);
        document.getElementById(squareId).innerText = player;
        let gameWon = checkWin(originalBoard, player);
        if (gameWon) gameOver(gameWon);
    } else {
        turn(squareId, player);
    }
}

//Check for a winner
function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winningCombinations.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

//Go back to main menu
function mainMenu() {
    location.reload();
}

//Handle the end of each game
function gameOver(gameWon) {
    for (let index of winningCombinations[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == humanPlayer ? "blue" : "red";
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", turnClick, false);
    }
    declareWinner(gameWon.player == humanPlayer ? "You win!" : "You lose :(");
    return true;
}

function declareWinner(winner) {
    if (mode === "single") {
        document.querySelector(".endgame").style.display = "block";
        document.querySelector(".endgame .text").innerText = winner;
    } else {
        document.querySelector(".multiplayer-endgame").style.display = "block";
        document.querySelector(".multiplayer-endgame .text").innerText = winner;
    }
}

function emptySquares() {
    return originalBoard.filter(s => typeof (s) == "number");
}

//Easy mode or impossible mode
function bestSpot() {
    if (difficulty === "easy") {
        return emptySquares()[0];
    } else {
        return minimax(originalBoard, aiPlayer).index;
    }
}

//Check for a tie
function checkTie() {
    if (emptySquares().length == 0) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener("click", turnClick, false);
        }
        declareWinner("Tie Game!");
    }
}

//Impossible mode minimax algorithm
function minimax(newBoard, player) {
    let availableSpots = emptySquares();

    if (checkWin(newBoard, humanPlayer)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        let move = {};
        move.index = newBoard[availableSpots[i]];
        newBoard[availableSpots[i]] = player;
        if (player == aiPlayer) {
            let result = minimax(newBoard, humanPlayer);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availableSpots[i]] = move.index;

        moves.push(move);
    }

    let bestMove;

    if (player === aiPlayer) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

//Multiplayer
function startMultiplayerGame() {
    document.querySelector(".endgame").style.display = "none";
    document.querySelector(".multiplayer-endgame").style.display = "none";
    document.querySelector(".multiplayer-turn").style.display = "block";
    document.querySelector(".main-menu").style.display = "block";
    document.querySelector(".multiplayer-turn h3").innerText = "Player 1 (X)";
    originalBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = "";
        cells[i].style.removeProperty("background-color");
        cells[i].addEventListener("click", turnMultiplayerClick, false);
    }
}

function turnMultiplayerClick(square) {
    if (typeof (originalBoard[square.target.id] == "number")) {
        turnMultiplayer(square.target.id, checkTurn());
    }
}

function turnMultiplayer(squareId, player) {
    originalBoard[squareId] = player;
    if (document.getElementById(squareId).innerText === "") {
        cells[squareId].removeEventListener("click", turnMultiplayerClick, false);
        document.getElementById(squareId).innerText = player;
        let gameWon = checkWin(originalBoard, player);
            if (gameWon) {
                multiplayerGameOver(gameWon);
            } else {
                checkTie();
            }
    }
}

function filledSquares() {
    return originalBoard.filter(s => typeof (s) != "number");
}

//Check whose turn it is depending on the amount of fille squares
function checkTurn() {
    let filledSpots = filledSquares();
    if (filledSpots.length % 2 == 0 || filledSpots.length == 0) {
        document.querySelector(".multiplayer-turn h3").innerText = "Player 2 (O)";
        filledSpots = filledSquares();
        return player1;
    } else if (filledSpots.length % 2 != 0) {
        document.querySelector(".multiplayer-turn h3").innerText = "Player 1 (X)";
        filledSpots = filledSquares();
        return player2;
    }
}

function multiplayerGameOver(gameWon) {
    for (let index of winningCombinations[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == player1 ? "yellow" : "purple";
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", turnClick, false);
    }
    declareWinner(gameWon.player == player1 ? "Player 1 wins!" : "Player 2 wins!");
    return true;
}
