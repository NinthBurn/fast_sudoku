import SudokuLogic from "./sudoku-logic.js";

document.addEventListener('DOMContentLoaded', function() {
    const sudokuGrid = document.getElementById('sudokuGrid');
    const numberButtons = document.getElementById('numberButtons');
    const newGameBtn = document.getElementById('newGameBtn');
    const checkSolutionBtn = document.getElementById('checkSolutionBtn');
    const setDifficultyBtn = document.getElementById('setDifficultyBtn');
    const difficultyDialog = document.getElementById('difficultyDialog');
    const generalDialog = document.getElementById('generalDialog');
    const generalDialogTitle = document.getElementById('generalDialogTitle');
    const generalDialogMessage = document.getElementById('generalDialogMessage');

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
    let totalValuesUsed = 0;
    let gameOver = false;

    initGame();
    createNumberButtons();
    createClearButton();
    createDifficultyMenu();

    newGameBtn.addEventListener('click', initGame);
    checkSolutionBtn.addEventListener('click', checkSolutionButtonCallback);
    setDifficultyBtn.addEventListener('click', openDifficultyMenu);
    nightModeToggle.addEventListener('click', toggleNightMode);

       ///=====================///
      /// - - - - - - - - - - ///
     ///    General Setup    ///
    /// - - - - - - - - - - ///
   ///=====================///
    
   function initGame() {
        // Clear the grid
        sudokuGrid.innerHTML = '';
        selectedCell = null;
        selectedNumber = null;
        gameOver = false;

        ({solution, puzzle} = SudokuLogic.generateSudoku(difficulty));

        createGridCells();
        clearHighlights();
        setupUsedValuesTable();
        resetMistakeCounter();

        // unselect buttons
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));

        if(nightModeToggled)
            sudokuGrid.childNodes.forEach(c => c.classList.toggle('night-mode-cell'));
    }


    function setupUsedValuesTable() {
        totalValuesUsed = 0;
        for(let i = 1; i <= gridSize; ++i)
            usedValues[i] = 0;

        for(let i = 0; i < gridSize; ++i)
            for(let j = 0; j < gridSize; ++j) {
                usedValues[puzzle[i][j]]++;
                if(puzzle[i][j] > 0)
                    totalValuesUsed++;
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
                setSelectedNumberFromButton(i);
                
                if(selectedCell !== null) {
                    let row = selectedCell.dataset.row;
                    let col = selectedCell.dataset.col;
        
                    // If a cell is selected, update it with the new number
                    if (puzzle[row][col] !== solution[row][col] && !selectedCell.classList.contains('fixed')) {
                        updateCell(selectedCell, i);
                    }
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
            clearHighlights();

            // If a cell is selected, clear it
            if (selectedCell && !selectedCell.classList.contains('fixed')) {
                updateCell(selectedCell, '');
            }
        });
        numberButtons.appendChild(clearBtn);
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

        initDialogElements();
    }


    function initDialogElements() {
        document.getElementById('difficultyDialogClose').addEventListener('click', () => {
            difficultyDialog.style.display = 'none';
        });

        document.getElementById('generalDialogClose').addEventListener('click', () => {
            generalDialog.style.display = 'none';
        });
    }


       ///=====================///
      /// - - - - - - - - - - ///
     ///   🤮 Highlight 🤮  ///
    /// - - - - - - - - - - ///
   ///=====================///


   function clearHighlights() {
        document.querySelectorAll('.cell-highlight, .cell-highlight-soft, .cell-highlight-wrong, .cell-highlight-correct, .selected-cell').forEach(el => {
            el.classList.remove('cell-highlight', 'number-highlight', 'cell-highlight-soft', 'cell-highlight-wrong', 'cell-highlight-correct', 'selected-cell');
        });
    }


    function setSelectedNumberFromGrid(value) {
        selectedNumber = value;
        const numberButtons = document.querySelectorAll('.number-btn');
        
        numberButtons.forEach(b => b.classList.remove('selected'))
        numberButtons[value - 1].classList.add('selected');
    }


    function setSelectedNumberFromButton(value) {
        selectedNumber = value;
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


    function highlightWholeBox(row, col) {
        let bound1 = row - row % 3, bound2 = col - col % 3;
        for(let m = bound1; m < bound1 + 3; ++m){
            for(let n = bound2; n < bound2 + 3; ++n) {
                sudokuGrid.childNodes[m * gridSize + n].classList.add('cell-highlight-soft');
            }
        }
    }


    function highlightCellsWithNumber(cell_number, skip_row, skip_col) {
        if(cell_number < 1)
            return;

        for(let i = 0; i < gridSize; ++i) {
            for(let j = 0; j < gridSize; ++j) {
                if(i == skip_row || j == skip_col)
                    continue;

                if(puzzle[i][j] == cell_number) {
                    // Highlight the box containing this number
                    highlightWholeBox(i, j);

                    const rowCells = document.querySelectorAll(`.cell[data-row="${i}"]`);
                    const colCells = document.querySelectorAll(`.cell[data-col="${j}"]`);
                    
                    rowCells.forEach(c => c.classList.add('cell-highlight-soft'));
                    colCells.forEach(c => c.classList.add('cell-highlight-soft'));

                    // Highlight number
                    if(puzzle[i][j] == solution[i][j]) {
                        sudokuGrid.childNodes[i * gridSize + j].classList.add("cell-highlight-correct");
                        sudokuGrid.childNodes[i * gridSize + j].classList.add("number-highlight");
                        sudokuGrid.childNodes[i * gridSize + j].classList.add("selected-cell");
                    } else {
                        sudokuGrid.childNodes[i * gridSize + j].classList.add("cell-highlight-wrong");
                    }
                    
                }
            }
        }
    }


       ///=====================///
      /// - - - - - - - - - - ///
     ///      Game Logic     ///
    /// - - - - - - - - - - ///
   ///=====================///


    function checkSolution() {
        let allCorrect = true;

        if(totalValuesUsed < gridSize * gridSize || gameOver)
            return false;
        
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
            showDialog('Congratulations!', 'You solved the Sudoku puzzle correctly!');
            gameOver = true;
        } else {
            showDialog('Solution Invalid', 'Incorrect numbers will be marked in red (if any).');
        }
    }


       ///=====================///
      /// - - - - - - - - - - ///
     ///       UI Logic      ///
    /// - - - - - - - - - - ///
   ///=====================///


   function checkSolutionButtonCallback() {
    if(gameOver) {
        showDialog('Game Over', 'You can start a new game.');
        return;
    }
    

    if(!checkSolution())
        showDialog('Solution Invalid', 'Incorrect numbers will be marked in red (if any).');
    }


    function openDifficultyMenu() {
        difficultyDialog.style.display = 'flex';
    }


    function showDialog(title, message) {
        generalDialog.style.display = 'flex';
        generalDialogTitle.innerText = title;
        generalDialogMessage.innerText = message;
    }

    
    function handleCellClick(cell, row, col) {  
        // Remove previous highlights
        clearHighlights();

        // Set the new selected cell
        selectedCell = cell;
        let currentNumber = puzzle[row][col];
        
        if(cell.classList.contains('fixed') || currentNumber == solution[row][col])
            setSelectedNumberFromGrid(currentNumber);
        else if(selectedNumber && currentNumber == selectedNumber && currentNumber != solution[row][col])  {
            updateCell(cell, '');
            highlightCellsWithNumber(selectedNumber, -1, -1);
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

        checkSolution();
    }


    function resetMistakeCounter() {
        mistakesCounter = 0;
        document.getElementById("mistakesCounter").innerText = "Mistakes: 0/3";
    }


    function incrementMistakeCounter() { 
        mistakesCounter++;
        document.getElementById("mistakesCounter").innerText = "Mistakes: " + mistakesCounter + "/3";

        if(mistakesCounter > 2) {
            showDialog('Game Over', 'You can start a new game.');
            gameOver = true;
        }
    }


    function updateCell(cell, value) {
        if(gameOver)
            return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (value === '') {
            cell.textContent = '';
            usedValues[puzzle[row][col]]--; totalValuesUsed--;
            puzzle[row][col] = 0;
            cell.classList.remove('incorrect');
        } else if(usedValues[value] < gridSize){
            cell.textContent = value;
            puzzle[row][col] = value;
            usedValues[value]++; totalValuesUsed++;

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
    

    function toggleNightMode() {
        document.body.classList.toggle('night-mode-body');
        sudokuGrid.childNodes.forEach(c => c.classList.toggle('night-mode-cell'));
        document.querySelectorAll('.number-btn').forEach(b => b.classList.toggle('night-mode-btn'));
        document.querySelectorAll('h1').forEach(h => h.classList.toggle('night-mode-text'));
        document.querySelectorAll('.dialog-content').forEach(h => h.classList.toggle('night-mode-body'));
        document.getElementById('sudokuGrid').classList.toggle('night-mode-cell');
        document.getElementById('sudokuGrid').classList.toggle('night-mode-cell-grid');

        if(nightModeToggled) {
            document.getElementById('nightModeIcon').src = "night-mode-1.svg";

        } else {
            document.getElementById('nightModeIcon').src = "night-mode-2.svg";
        }

        nightModeToggled = !nightModeToggled;
    }


});