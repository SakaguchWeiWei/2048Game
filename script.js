const size = 4;
let board = [];
let score = 0;
let lastMoveDirection = 'left';
let mergedCells = [];
let status = document.getElementById('status');

function initBoard() {
    board = Array.from({ length: size }, () => Array(size).fill(0));
    score = 0;
    addRandomTile();
    addRandomTile();
    draw();
}

function addRandomTile() {
    let empty = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length === 0) return;
    let { r, c } = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function draw() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            let cell = document.createElement('div');
            let val = board[r][c];
            cell.className = `cell cell-${val} slide-${lastMoveDirection}`;
            if (mergedCells.some(m => m.r === r && m.c === c)) {
                cell.classList.add('explode');
            }
            cell.textContent = val !== 0 ? val : '';
            container.appendChild(cell);
        }
    }
    updateScore();
}

function slideRow(row, r, reversed = false) {
    let arr = reversed ? row.slice().reverse() : row.slice();
    let newRow = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 0) continue;
        if (arr[i] === arr[i + 1]) {
            let val = arr[i] * 2;
            score += val;
            newRow.push(val);
            let col = reversed ? size - newRow.length : newRow.length - 1;
            mergedCells.push({ r, c: col });
            arr[i + 1] = 0;
            i++;
        } else {
            newRow.push(arr[i]);
        }
    }
    while (newRow.length < size) newRow.push(0);
    if (reversed) newRow.reverse();
    return newRow;
}

function rotateCW(matrix) {
    let res = Array.from({ length: size }, () => Array(size).fill(0));
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            res[c][size - r - 1] = matrix[r][c];
        }
    }
    return res;
}

function rotatePointCW(p) {
    return { r: p.c, c: size - 1 - p.r };
}

function rotatePointCCW(p) {
    return { r: size - 1 - p.c, c: p.r };
}

function moveLeft() {
    mergedCells = [];
    lastMoveDirection = 'left';
    let moved = false;
    for (let r = 0; r < size; r++) {
        let original = board[r].slice();
        board[r] = slideRow(board[r], r);
        if (!moved && board[r].some((v, i) => v !== original[i])) moved = true;
    }
    return moved;
}

function moveRight() {
    mergedCells = [];
    lastMoveDirection = 'right';
    let moved = false;
    for (let r = 0; r < size; r++) {
        let original = board[r].slice();
        board[r] = slideRow(board[r], r, true);
        if (!moved && board[r].some((v, i) => v !== original[i])) moved = true;
    }
    return moved;
}

function moveUp() {
    mergedCells = [];
    lastMoveDirection = 'up';
    board = rotateCW(board);
    board = rotateCW(board);
    board = rotateCW(board);
    let moved = false;
    for (let r = 0; r < size; r++) {
        let original = board[r].slice();
        board[r] = slideRow(board[r], r);
        if (!moved && board[r].some((v, i) => v !== original[i])) moved = true;
    }
    mergedCells = mergedCells.map(rotatePointCW);
    board = rotateCW(board);
    return moved;
}

function moveDown() {
    mergedCells = [];
    lastMoveDirection = 'down';
    board = rotateCW(board);
    let moved = false;
    for (let r = 0; r < size; r++) {
        let original = board[r].slice();
        board[r] = slideRow(board[r], r);
        if (!moved && board[r].some((v, i) => v !== original[i])) moved = true;
    }
    mergedCells = mergedCells.map(rotatePointCCW);
    board = rotateCW(board);
    board = rotateCW(board);
    board = rotateCW(board);
    return moved;
}

function checkGameOver() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) return false;
            if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
            if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}

document.addEventListener('keydown', e => {
    let moved = false;
    switch (e.key) {
        case 'ArrowLeft':
            moved = moveLeft();
            break;
        case 'ArrowRight':
            moved = moveRight();
            break;
        case 'ArrowUp':
            moved = moveUp();
            break;
        case 'ArrowDown':
            moved = moveDown();
            break;
    }
    if (moved) {
        addRandomTile();
        draw();
        if (checkGameOver()) {
            status.textContent = 'Game Over!';
        }
    }
});

let autoInterval = null;

function getMaxTile() {
    return Math.max(...board.flat());
}

function simulateMove(direction) {
    const backupBoard = board.map(row => row.slice());
    const backupScore = score;
    const backupMerged = mergedCells.slice();
    let moved = false;
    switch (direction) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }
    const newBoard = board.map(row => row.slice());
    board = backupBoard;
    score = backupScore;
    mergedCells = backupMerged;
    return moved ? newBoard : null;
}

function evaluateBoard(b) {
    let empty = 0;
    let max = 0;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (b[r][c] === 0) empty++;
            if (b[r][c] > max) max = b[r][c];
        }
    }
    return empty * 1000 + max;
}

function getBestMove() {
    const dirs = ['left', 'right', 'up', 'down'];
    let bestDir = null;
    let bestScore = -Infinity;
    for (let d of dirs) {
        const sim = simulateMove(d);
        if (!sim) continue;
        const val = evaluateBoard(sim);
        if (val > bestScore) {
            bestScore = val;
            bestDir = d;
        }
    }
    return bestDir;
}

function autoMove() {
    const dir = getBestMove();
    if (!dir) return false;
    let moved = false;
    switch (dir) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }
    if (moved) {
        addRandomTile();
        draw();
    }
    return moved;
}

function startAutoPlay() {
    if (autoInterval) return;
    status.textContent = 'Auto playing...';
    document.getElementById('auto-play').textContent = 'Stop';
    autoInterval = setInterval(() => {
        if (checkGameOver() || getMaxTile() >= 2048) {
            clearInterval(autoInterval);
            autoInterval = null;
            status.textContent = getMaxTile() >= 2048 ? 'Reached 2048!' : 'Game Over!';
            document.getElementById('auto-play').textContent = 'Auto Play';
            return;
        }
        autoMove();
    }, 300);
}

function stopAutoPlay() {
    if (!autoInterval) return;
    clearInterval(autoInterval);
    autoInterval = null;
    status.textContent = '';
    document.getElementById('auto-play').textContent = 'Auto Play';
}

document.getElementById('auto-play').addEventListener('click', () => {
    if (autoInterval) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
});

initBoard();
