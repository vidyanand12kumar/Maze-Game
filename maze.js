export class Maze {
    constructor(rows, cols, blockedNodes) {
        this.rows = rows;
        this.cols = cols;
        this.blockedNodes = blockedNodes;
        this.grid = [];
        this.start = { row: 0, col: 0 };
        this.end = { row: rows - 1, col: cols - 1 };
        this.path = [];
        this.isPaused = false; // Flag to check if maze is paused
        this.shouldContinue = true; // Control flag for pathfinding
        this.generateGrid();
        this.previousVisited=[]
        this.started=false;
        this.gameFinished = false;
    }

    generateGrid() {
        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.placeBlockedNodes();
        this.grid[this.start.row][this.start.col] = 'S';
        this.grid[this.end.row][this.end.col] = 'E';
    }

    placeBlockedNodes() {
        let placed = 0;
        while (placed < this.blockedNodes) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (this.grid[row][col] === 0 && !(row === this.start.row && col === this.start.col) && !(row === this.end.row && col === this.end.col)) {
                this.grid[row][col] = 1;
                placed++;
            }
        }
    }

    async findPath() {
        this.shouldContinue = true; // Allow processing to continue
        const path = [];
        this.visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false)); // New visited array for each search
        const pathFound = await this.backtrack(this.start.row, this.start.col);
        this.path = path;
        return pathFound;
    }

    async backtrack(row, col,prevDirection = null) {
        // Immediately return if paused
        
        while (this.isPaused) {
            await this.delay(100); // Wait until it's resumed
        }
        
        if (!this.shouldContinue) {
            return false; // Exit if paused
        }

        // Check if reached end point
        if (row === this.end.row && col === this.end.col) {
            this.path.push({ row, col });
            this.updateRatPosition(row, col, prevDirection);
            return true; // Path found
        }

        // Out of bounds or cell is blocked/visited
        if (row < 0 || col < 0 || row >= this.rows || col >= this.cols || this.grid[row][col] === 1 || this.visited[row][col]) {
            return false; // Invalid move
        }

       this.visited[row][col] = true; // Mark as visited
        this.path.push({ row, col });

        // Update rat's position in the UI and delay
        this.updateRatPosition(row, col, prevDirection);
        await this.delay(2000); // Add delay for visualization

        // Check for pause before making next moves
        if (!this.shouldContinue) {
            // this.currentPosition = { row, col }; // Save the current position
            return false; // Exit if paused
        }

        while (this.isPaused) {
            await this.delay(100); // Wait until it's resumed
        }

        // Move in all four directions
        const directions = [
            { move: [0, 1], direction: 'right' },  // Right
            { move: [1, 0], direction: 'down' },   // Down
            { move: [0, -1], direction: 'left' },  // Left
            { move: [-1, 0], direction: 'up' }     // Up
        ];
        
        for (const { move: [dr, dc], direction } of directions) {
            // Check for pause before recursion
            if (!this.shouldContinue) {
                // this.currentPosition = { row, col }; // Save the current position
                return false; // Exit if paused
            }
            while (this.isPaused) {
                await this.delay(100); // Wait until it's resumed
            }

            if (await this.backtrack(row + dr, col + dc, direction)) return true; // Found path
        }

        // Check for pause after trying all directions
        if (!this.shouldContinue) {
            // this.currentPosition = { row, col }; // Save the current position
            return false; // Exit if paused
        }
        while (this.isPaused) {
            await this.delay(100); // Wait until it's resumed
        }

        this.path.pop(); // No path found, backtrack
        this.updateRatPosition(row, col, prevDirection, true); // Show backtracking
        // await this.delay(2000);

        return false; // No path found
    }

    updateRatPosition(row, col, direction, isBacktracking = false) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.remove('current', 'backtrack', 'path-right', 'path-down', 'path-left', 'path-up');
            if (isBacktracking) {
                cell.classList.add('backtrack');
            } else {
                cell.classList.add('current');
                if (direction) cell.classList.add(`path-${direction}`);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

   
    reset() {
        this.shouldContinue = false; // Stop any ongoing pathfinding
        this.isPaused = false; // Ensure the maze is not paused
        this.path = []; // Clear any existing path
        this.generateGrid(); // Regenerate the maze grid
        this.clearUI(); // Clear UI states
    }
    clearUI() {
        const container = document.getElementById('maze-container');
        const cells = container.getElementsByClassName('cell');
        for (let cell of cells) {
            cell.classList.remove('current', 'backtrack', 'path-right', 'path-down', 'path-left', 'path-up');
        }
    }
}