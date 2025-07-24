const rows = 8;
const cols = 8;
const mines = 9;

function createCells(grid) {
    let cells = [];

    for (let cellIndex = 0; cellIndex < rows * cols; cellIndex++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = cellIndex;
        grid.appendChild(cell);
        cells.push(cell);
    }

    return cells;
}

function generateMineIndex() {
    const min = 0;
    const max = (rows * cols) - 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addMines(cells) {
    const minesIndices = [];

    for (let index = 0; index < mines; index++) {
        let mineIndex = 0;
        // avoid duplicated indecies
        do {
            // generate index untill its unique
            mineIndex = generateMineIndex();
        } while (minesIndices.includes(mineIndex));

        cells[mineIndex].classList.add('mine');

        minesIndices.push(mineIndex);
    }
}

function getAdjacentIndecies(index) {
    // to get previous row: - col
    // to get nex row: + col
    // % cols prevents incorrect calculations for wrapping around the edges

    const topLeft = index % cols === 0 ? -1 : index - cols - 1;
    const topRight = index % cols === cols - 1 ? -1 : index - cols + 1;

    const top = index - cols;
    const left = index % cols === 0 ? -1 : index - 1;
    const right = index % cols === cols - 1 ? -1 : index + 1;
    const bottom = index + cols;

    const bottomLeft = index % cols === 0 ? -1 : index + cols - 1;
    const bottomRight = index % cols === cols - 1 ? -1 : index + cols + 1;

    const indecies = [topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight];

    return indecies.filter(index => index >= 0 && index < cols * rows);
}

function calculateAdjacentMines(cells) {
    for (let index = 0; index < cells.length; index++) {
        let adjacentMines = 0;

        // skip mines
        const cell = cells[index];
        if (cell.classList.contains('mine')) {
            continue;
        }

        const adjacentIndecies = getAdjacentIndecies(index);
        adjacentIndecies.map(indexToCheck => {
            if (cells[indexToCheck].classList.contains('mine')) adjacentMines++;
        });

        cell.innerText = adjacentMines;
    }
}

function uncoverEmptySpaces(index, cells, checkedIndices) {
    let adjacentCellsIndices = getAdjacentIndecies(index)
    adjacentCellsIndices = adjacentCellsIndices.filter(index => !checkedIndices.includes(index));

    checkedIndices.push(...adjacentCellsIndices);

    adjacentCellsIndices.forEach(index => {
        const adjacentCell = cells[index];

        const isEmpty = Number(adjacentCell.innerText) === 0;
        const isMine = adjacentCell.classList.contains('mine');
        const isMarked = adjacentCell.classList.contains('marked')

        if (!isMarked) adjacentCell.classList.add('checked');


        if (isEmpty && !isMine && !isMarked) {
            uncoverEmptySpaces(index, cells, checkedIndices);
        }
    });
}

function chord(cell, cells) {
    let adjacentMines = Number(cell.innerText);
    if (adjacentMines === 0) return;

    let cellIndex = Number(cell.dataset.index);
    const adjacentCellsIndices = getAdjacentIndecies(cellIndex);

    let markedCells = 0;
    let uncheckedCellsIndices = []

    adjacentCellsIndices.forEach(index => {
        const isMarked = cells[index].classList.contains('marked');
        const isChecked = cells[index].classList.contains('checked');

        if (isMarked) markedCells++;
        if (!isChecked && !isMarked) uncheckedCellsIndices.push(index);
    });

    if (markedCells === adjacentMines) {
        uncheckedCellsIndices.forEach(index => clickCell(cells[index], cells));
    }
}

function clickCell(cell, cells) {
    if (cell.id && cell.id === 'grid') return;
    if (cell.classList.contains('marked')) return;

    cell.classList.add('checked');

    if (cell.classList.contains('mine')) {
        gameOver();
        return;
    }

    if (Number(cell.innerText) !== 0) {
        checkForWin();
        return;
    }

    uncoverEmptySpaces(Number(cell.dataset.index), cells, []);
    checkForWin();
}

function gameOver() {
    const mines = document.querySelectorAll('.mine');
    mines.forEach(mine => mine.classList.add('checked'));

    setTimeout(() => alert('Game Over'), 100);
}

function checkForWin() {
    let checkedCells = document.querySelectorAll('.checked');
    if (checkedCells.length === (rows * cols) - mines) win();
}

function win() {
    setTimeout(() => alert('You Won!'), 100);
}

function handleClick(event, cells) {
    const clickedCell = event.target;

    if (clickedCell.classList.contains('checked')) {
        chord(clickedCell, cells);
        return;
    }

    if (clickedCell.id && clickedCell.id === 'grid') return;
    if (clickedCell.classList.contains('marked')) return;

    if (clickedCell.classList.contains('mine')) {
        gameOver();
        return;
    }

    clickCell(clickedCell, cells);
}

function handleRightClick(event, cells) {
    event.preventDefault();
    const clickedCellIndex = Number(event.target.dataset.index);

    let cell = cells[clickedCellIndex];

    if (cell.classList.contains('checked')) return;

    cell.classList.toggle('marked');
}

document.addEventListener('DOMContentLoaded', () => {
    let grid = document.getElementById('grid');
    let cells = createCells(grid);
    addMines(cells);
    calculateAdjacentMines(cells);

    // add 1 event listener to the whole grid for memory optimization
    // instead of adding event listener to every cell
    grid.addEventListener('click', (event) => handleClick(event, cells));
    grid.addEventListener('contextmenu', (event) => handleRightClick(event, cells));

    // update styles
    // update end screens
    // add timer
    // add different difficulties
    // add leaderboard
});