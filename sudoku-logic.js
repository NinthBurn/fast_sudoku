export default class SudokuLogic {
    static gridSize = 9;

    constructor() {}

    static generateSudoku(difficulty) {
        // Generate a solved Sudoku board
        let solution = this.generateSolvedBoard(this.gridSize);
        
        // Create a puzzle by removing numbers
        let puzzle = JSON.parse(JSON.stringify(solution));
        this.removeNumbers(puzzle, difficulty);
    
        return {
            'solution': solution,
            'puzzle': puzzle
        };
    }
    
    
    static generateSolvedBoard() {
        const board = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        
        // Fill the diagonal 3x3 boxes
        this.fillDiagonalBoxes(board);
        
        // Solve the rest of the board
        this.solveSudoku(board);
        
        return board;
    }
    
    
    static fillDiagonalBoxes(board) {
        for (let box = 0; box < this.gridSize; box += 3) {
            this.fillBox(board, box, box);
        }
    }
    
    
    static fillBox(board, row, col) {
        const nums = Array.from({length: this.gridSize}, (_, i) => i + 1)
        this.shuffleArray(nums);
        
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[row + i][col + j] = nums[index++];
            }
        }
    }
    
    
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    
    static solveSudoku(board) {
        const emptyCell = this.findEmptyCell(board);
        if (!emptyCell) return true; // Puzzle solved
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= this.gridSize; num++) {
            if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                
                if (this.solveSudoku(board)) {
                    return true;
                }
                
                board[row][col] = 0; // Backtrack
            }
        }
        
        return false; // No solution found
    }
    
    
    static findEmptyCell(board) {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (board[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }
    
    
    static isValid(board, row, col, num) {
        // Check row
        for (let j = 0; j < this.gridSize; j++) {
            if (board[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < this.gridSize; i++) {
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
    
    
    static removeNumbers(board, difficulty) {
        // Determine how many cells to remove based on difficulty
        const cellsToRemove = Math.floor(difficulty * 60) + 20;
        
        for (let i = 0; i < cellsToRemove; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * this.gridSize);
                col = Math.floor(Math.random() * this.gridSize);
            } while (board[row][col] === 0);
            
            board[row][col] = 0;
        }
    }
}