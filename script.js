const size = 4;
let board = [];
let status = document.getElementById('status');

function initBoard() {
    board = Array.from({ length: size }, () => Array(size).fill(0));
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

function draw() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            let cell = document.createElement('div');
            let val = board[r][c];
            cell.className = `cell cell-${val}`;
            cell.textContent = val !== 0 ? val : '';
            container.appendChild(cell);
        }
    }
}

function slide(arr) {
    let filtered = arr.filter(v => v);
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            filtered[i + 1] = 0;
        }
    }
    let result = filtered.filter(v => v);
    while (result.length < size) result.push(0);
    return result;
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

function moveLeft() {
    let moved = false;
    for (let r = 0; r < size; r++) {
        let original = board[r].slice();
        board[r] = slide(board[r]);
        if (!moved && board[r].some((v, i) => v !== original[i])) moved = true;
    }
    return moved;
}

function moveRight() {
    board = board.map(row => row.reverse());
    let moved = moveLeft();
    board = board.map(row => row.reverse());
    return moved;
}

function moveUp() {
    board = rotateCW(board);
    board = rotateCW(board);
    board = rotateCW(board);
    let moved = moveLeft();
    board = rotateCW(board);
    return moved;
}

function moveDown() {
    board = rotateCW(board);
    let moved = moveLeft();
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

initBoard();
