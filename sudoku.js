document.addEventListener('DOMContentLoaded', function() {
    const sudokuGrid = document.getElementById('sudokuGrid');
    const numberButtons = document.getElementById('numberButtons');
    const newGameBtn = document.getElementById('newGameBtn');
    const checkSolutionBtn = document.getElementById('checkSolutionBtn');
    const setDifficultyBtn = document.getElementById('setDifficultyBtn');
    const difficultyDialog = document.getElementById('difficultyDialog');
    const nightModeToggle = document.getElementById('nightModeButton');
    
    let nightModeToggled = false;
    let selectedNumber = null;
    let selectedCell = null;
    let solution = [];
    let puzzle = [];
    let difficulty = 0.5;
    let mistakesCounter = 0;
    let gridSize = 9;
    let usedValues = [];

    for(let i = 0; i < gridSize; ++i)
        usedValues.push(0);
    initGame();
    createNumberButtons();
    createClearButton();
    createDifficultyMenu();

    newGameBtn.addEventListener('click', initGame);
    checkSolutionBtn.addEventListener('click', checkSolution);
    setDifficultyBtn.addEventListener('click', setDifficulty);
    nightModeToggle.addEventListener('click', toggleNightMode);

    function initGame() {
        // Clear the grid
        sudokuGrid.innerHTML = '';
        selectedCell = null;
        selectedNumber = null;
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
        generateSudoku();
        createGridCells();
        clearHighlights();

        if(nightModeToggled)
            sudokuGrid.childNodes.forEach(c => c.classList.toggle('night-mode-cell'));
    }

    function setDifficulty() {
        difficultyDialog.style.display = 'flex';
    }
    
    function handleCellClick(cell, row, col) {  
        // Remove previous highlights
        clearHighlights();

        // Set the new selected cell
        selectedCell = cell;
        let currentNumber = puzzle[row][col];
        
        if(cell.classList.contains('fixed') || currentNumber == solution[row][col])
            setSelectedNumber(currentNumber);
        else if(selectedNumber && currentNumber == selectedNumber && currentNumber != solution[row][col])  {
            updateCell(cell, '');
            return;
        }

        highlightCellsWithNumber(selectedNumber, row, col);

        // highlight this row/column more
        highlightCellRowsColumns(row, col);

        // Keep selected-cell on top of other highlights
        cell.classList.remove('cell-highlight');
        cell.classList.add('selected-cell');

        // If a number is selected and this is a modifiable cell, update it
        if (currentNumber != solution[row][col] && selectedNumber !== null && !cell.classList.contains('fixed')) {
            updateCell(cell, selectedNumber);
        }
    }

    function clearHighlights() {
        document.querySelectorAll('.cell-highlight, .cell-highlight-soft, .cell-highlight-wrong, .cell-highlight-correct, .selected-cell').forEach(el => {
            el.classList.remove('cell-highlight', 'number-highlight', 'cell-highlight-soft', 'cell-highlight-wrong', 'cell-highlight-correct', 'selected-cell');
        });
    }
    
    function setSelectedNumber(value) {
        selectedNumber = value;
        const numberButtons = document.querySelectorAll('.number-btn');
        
        numberButtons.forEach(b => b.classList.remove('selected'))
        numberButtons[value - 1].classList.add('selected');

        clearHighlights();
        highlightCellsWithNumber(value, -1, -1);
    }

    function highlightCellRowsColumns(row, col) {                				
        const rowCells = document.querySelectorAll(`.cell[data-row="${row}"]`);
        const colCells = document.querySelectorAll(`.cell[data-col="${col}"]`);
        
        rowCells.forEach(c => c.classList.remove('cell-highlight-soft'));
        colCells.forEach(c => c.classList.remove('cell-highlight-soft'));

        rowCells.forEach(c => c.classList.add('cell-highlight'));
        colCells.forEach(c => c.classList.add('cell-highlight'));
    }

    function highlightCellRowsColumnsWrong(row, col) {                				
        const rowCells = document.querySelectorAll(`.cell[data-row="${row}"]`);
        const colCells = document.querySelectorAll(`.cell[data-col="${col}"]`);
        
        rowCells.forEach(c => c.classList.remove('cell-highlight', 'cell-highlight-soft'));
        colCells.forEach(c => c.classList.remove('cell-highlight', 'cell-highlight-soft'));

        rowCells.forEach(c => c.classList.add('cell-highlight-wrong'));
        colCells.forEach(c => c.classList.add('cell-highlight-wrong'));
    }

    function highlightCellsWithNumber(cell_number, skip_row, skip_col) {
        if(cell_number < 1)
            return;

        for(let i = 0; i < gridSize; ++i) {
            for(let j = 0; j < gridSize; ++j) {
                if(i == skip_row || j == skip_col)
                    continue;

                if(puzzle[i][j] == cell_number) {
                    // Highlight row and column
                    const rowCells = document.querySelectorAll(`.cell[data-row="${i}"]`);
                    const colCells = document.querySelectorAll(`.cell[data-col="${j}"]`);
                    
                    rowCells.forEach(c => c.classList.add('cell-highlight-soft'));
                    colCells.forEach(c => c.classList.add('cell-highlight-soft'));

                    // Highlight number
                    //sudokuGrid.childNodes[i * gridSize + j].classList.remove("cell-highlight-soft");
                    sudokuGrid.childNodes[i * gridSize + j].classList.add("cell-highlight-correct");
                    sudokuGrid.childNodes[i * gridSize + j].classList.add("number-highlight");
                    sudokuGrid.childNodes[i * gridSize + j].classList.add("selected-cell");
                }
            }
        }
    }
    
    function incrementMistakeCounter() { 
        mistakesCounter++;
        document.getElementById("mistakesCounter").innerText = "Mistakes: " + mistakesCounter + "/3";

        if(mistakesCounter > 2) {
            mistakesCounter = 0;
            document.getElementById("mistakesCounter").innerText = "Mistakes: 0/3";
            alert('Game over. Another set will be generated.');
            initGame();
        }
    }

    function updateCell(cell, value) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (value === '') {
            cell.textContent = '';
            puzzle[row][col] = 0;
            cell.classList.remove('incorrect');
        } else {
            cell.textContent = value;
            puzzle[row][col] = value;
            
            // Check if the value is correct
            if (value !== solution[row][col]) {
                cell.classList.add('incorrect');
                highlightCellRowsColumnsWrong(row, col);
                incrementMistakeCounter();
            } else {
                cell.classList.remove('incorrect');
            }
        }
    }
    
    function createNumberButtons() {
        for (let i = 1; i <= gridSize; i++) {
            const btn = document.createElement('div');
            btn.className = 'number-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                setSelectedNumber(i);
                
                let row = selectedCell.dataset.row;
                let col = selectedCell.dataset.col;
    
                // If a cell is selected, update it with the new number
                if (selectedCell && puzzle[row][col] != solution[row][col] && !selectedCell.classList.contains('fixed')) {
                    updateCell(selectedCell, i);
                }
            });
            numberButtons.appendChild(btn);
        }
    }

    function createClearButton() {
        const clearBtn = document.createElement('div');
        clearBtn.className = 'number-btn';
        clearBtn.textContent = 'X';
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
            selectedNumber = null;
            
            // If a cell is selected, clear it
            if (selectedCell && !selectedCell.classList.contains('fixed')) {
                updateCell(selectedCell, '');
            }
        });
        numberButtons.appendChild(clearBtn);
    }

    function toggleNightMode() {
        document.body.classList.toggle('night-mode-body');
        sudokuGrid.childNodes.forEach(c => c.classList.toggle('night-mode-cell'));
        document.querySelectorAll('.number-btn').forEach(b => b.classList.toggle('night-mode-cell'));
        document.querySelectorAll('h1').forEach(h => h.classList.toggle('night-mode-text'));
        //document.querySelectorAll('h3').forEach(h => h.classList.toggle('night-mode-text'));
        document.getElementById('sudokuGrid').classList.toggle('night-mode-cell');
        document.getElementById('sudokuGrid').classList.toggle('night-mode-cell-grid');

        if(nightModeToggled) {
            document.getElementById('nightModeIcon').src = "night-mode-1.svg";

        } else {
            document.getElementById('nightModeIcon').src = "night-mode-2.svg";
        }

        nightModeToggled = !nightModeToggled;
    }

    function generateSudoku() {
        // Generate a solved Sudoku board
        solution = generateSolvedBoard();
        
        // Create a puzzle by removing numbers
        puzzle = JSON.parse(JSON.stringify(solution));
        removeNumbers(puzzle, difficulty);
    }
    
    function createGridCells() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (i % 3 === 2 && i !== 8) {
                    cell.classList.add('cell-border-bottom');
                }
                
                // If this is a fixed number from the puzzle
                if (puzzle[i][j] !== 0) {
                    cell.textContent = puzzle[i][j];
                    cell.classList.add('fixed');
                } else {
                    cell.classList.add('user-input');
                }
                
                cell.addEventListener('click', () => handleCellClick(cell, i, j));
                
                sudokuGrid.appendChild(cell);
            }
        }
    }

    function createDifficultyMenu() {
        document.querySelectorAll('.difficulty-options button').forEach(btn => {
            btn.addEventListener('click', () => {
                difficulty = parseFloat(btn.dataset.difficulty);
                initGame();
                difficultyDialog.style.display = 'none';
            });
        });
    
        document.querySelector('.dialog-close').addEventListener('click', () => {
            difficultyDialog.style.display = 'none';
        });
    }

    function generateSolvedBoard() {
        const board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
        // Fill the diagonal 3x3 boxes
        fillDiagonalBoxes(board);
        
        // Solve the rest of the board
        solveSudoku(board);
        
        return board;
    }
    
    function fillDiagonalBoxes(board) {
        for (let box = 0; box < gridSize; box += 3) {
            fillBox(board, box, box);
        }
    }
    
    function fillBox(board, row, col) {
        const nums = Array.from({length: gridSize}, (_, i) => i + 1)
        shuffleArray(nums);
        
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[row + i][col + j] = nums[index++];
            }
        }
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function solveSudoku(board) {
        const emptyCell = findEmptyCell(board);
        if (!emptyCell) return true; // Puzzle solved
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= gridSize; num++) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                
                if (solveSudoku(board)) {
                    return true;
                }
                
                board[row][col] = 0; // Backtrack
            }
        }
        
        return false; // No solution found
    }
    
    function findEmptyCell(board) {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }
    
    function isValid(board, row, col, num) {
        // Check row
        for (let j = 0; j < gridSize; j++) {
            if (board[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < gridSize; i++) {
            if (board[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }
        
        return true;
    }
    
    function removeNumbers(board, difficulty) {
        // Determine how many cells to remove based on difficulty
        const cellsToRemove = Math.floor(difficulty * 60) + 20;
        
        for (let i = 0; i < cellsToRemove; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * gridSize);
                col = Math.floor(Math.random() * gridSize);
            } while (board[row][col] === 0);
            
            board[row][col] = 0;
        }
    }
    
    function checkSolution() {
        let allCorrect = true;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                
                // Skip fixed cells
                if (cell.classList.contains('fixed')) continue;
                
                // Check if the user's input matches the solution
                const cellValue = cell.textContent ? parseInt(cell.textContent) : 0;
                if (cellValue !== solution[i][j]) {
                    cell.classList.add('incorrect');
                    allCorrect = false;
                }
            }
        }
        
        if (allCorrect) {
            alert('Congratulations! You solved the Sudoku puzzle correctly!');
        } else {
            alert('Some numbers are incorrect. Incorrect numbers are marked in red.');
        }
    }
});