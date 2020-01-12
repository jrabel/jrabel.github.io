var canvas = document.getElementById("myCanvas");
var mainMenu = document.getElementById("main-menu");
var cellSizeInput = document.getElementById("cellSizeInput");
var boardWidthInput = document.getElementById("boardWidthInput");
var boardHeightInput = document.getElementById("boardHeightInput");

var ctx = canvas.getContext("2d");

canvas.width = document.getElementById("boardCanvas").clientWidth;
canvas.height = document.body.clientHeight - mainMenu.clientHeight;

var cellDim = 10;

cellSizeInput.value = cellDim;
boardWidthInput.value = canvas.width;
boardHeightInput.value = canvas.height;


var mainBoard = initEmptyBoard();
randomizeBoardState(mainBoard);

var playing = true;
var drawing = false;
var erasing = false;

function initEmptyBoard() {
    var iCellCount = Math.floor(canvas.width / cellDim);
    var jCellCount = Math.floor(canvas.height / cellDim);
    var board = new Array(iCellCount);
    for (var i = 0; i < board.length; i++) {
        board[i] = new Array(jCellCount).fill(0);
    }
    return board;
}

function randomizeBoardState(board) {
    var slider = document.getElementById("randomDensity");
    var density = slider.value / 100;

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var randomState = Math.random() <= density;
            board[i][j] = randomState;
        }
    }
}

function createBoardDeepCopy(board) {
    var boardCopy = new Array(board.length);
    for (var i = 0; i < boardCopy.length; i++) {
        boardCopy[i] = board[i].slice();
    }
    return boardCopy;
}

function getLivingNeighborCount(i, j, board) {
    var livingNeighborCount = 0;
    // NW
    if (i > 0) {
        if (j > 0)
            livingNeighborCount += board[i - 1][j - 1];
        // N
        livingNeighborCount += board[i - 1][j];
        // NE
        if (j < (board[i].length - 1))
            livingNeighborCount += board[i - 1][j + 1];
    }

    // W
    if (j > 0)
        livingNeighborCount += board[i][j - 1];
    // E
    if (j < (board[i].length - 1))
        livingNeighborCount += board[i][j + 1];

    if (i < (board.length - 1)) {
        // SW
        if (j > 0)
            livingNeighborCount += board[i + 1][j - 1];
        // S
        livingNeighborCount += board[i + 1][j];
        // SE
        if (j < (board[i].length - 1))
            livingNeighborCount += board[i + 1][j + 1];
    }

    return livingNeighborCount;
}

function updateBoard(board) {
    var updatedBoard = createBoardDeepCopy(board);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var livingNeighborCount = getLivingNeighborCount(i, j, board);
            if (board[i][j]) {
                if (!((livingNeighborCount == 2) || (livingNeighborCount == 3))) updatedBoard[i][j] = 0;
            }
            else {
                if (livingNeighborCount == 3) updatedBoard[i][j] = 1;
            }
        }
    }
    return updatedBoard;
}

function renderBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var x = i * cellDim;
            var y = j * cellDim;
            ctx.beginPath();
            ctx.rect(x, y, cellDim, cellDim);

            var fillColor;
            if (board[i][j]) fillColor = '#000000';
            else fillColor = '#FFFFFF';

            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.closePath();
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (playing)
        mainBoard = updateBoard(mainBoard);

    renderBoard(mainBoard);

    if (drawing || erasing) {
        var cellX = Math.floor(hoverPositionX / cellDim);
        var cellY = Math.floor(hoverPositionY / cellDim);
        var x = cellX * cellDim;
        var y = cellY * cellDim;
        ctx.beginPath();
        ctx.rect(x, y, cellDim, cellDim);
        if (drawing)
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        if (erasing)
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();
        ctx.closePath();
    }
}

function playButtonClicked() {
    playing = true;
    drawing = false;
    erasing = false;
}

function pauseButtonClicked() {
    playing = false;
}

function generateButtonClicked() {
    playing = false;
    cellDim = cellSizeInput.value;
    canvas.width = boardWidthInput.value;
    canvas.height = boardHeightInput.value;
    mainBoard = initEmptyBoard();
    randomizeBoardState(mainBoard);
}

function randomizeStateButtonClicked() {
    playing = false;
    drawing = false;
    erasing = false;
    randomizeBoardState(mainBoard);
}

function drawButtonClicked() {
    playing = false;
    drawing = true;
    erasing = false;
}

function eraseButtonClicked() {
    playing = false;
    drawing = false;
    erasing = true;
}

function clearButtonClicked() {
    playing = false;
    drawing = false;
    erasing = false;
    mainBoard = initEmptyBoard();
}

var box = document.querySelector(".box");

var hoverPositionX;
var hoverPositionY;

function updateDisplay(event) {
    hoverPositionX = event.offsetX;
    hoverPositionY = event.offsetY;

    var cellX = Math.floor(hoverPositionX / cellDim);
    var cellY = Math.floor(hoverPositionY / cellDim);

    if (drawing && event.buttons)
        mainBoard[cellX][cellY] = 1;

    if (erasing && event.buttons)
        mainBoard[cellX][cellY] = 0;
}

canvas.addEventListener("mousemove", updateDisplay, false);
canvas.addEventListener("mousedown", updateDisplay, false);

setInterval(render, 100);