import { Maze } from "./maze.js";

export class UIController {
    constructor() {
        this.maze = null;
        this.messageElement = document.getElementById('message'); // Get message area element
        this.displayMessage('please click on start to play game!')
        this.debounceDuration = 500; // Set debounce duration in milliseconds

        // Debounced versions of the main functions
        this.startMaze = this.debounce(this.startMaze.bind(this), this.debounceDuration);
        this.pauseMaze = this.debounce(this.pauseMaze.bind(this), this.debounceDuration);
        this.resumeMaze = this.debounce(this.resumeMaze.bind(this), this.debounceDuration);
        this.restartMaze = this.debounce(this.restartMaze.bind(this), this.debounceDuration);
    }

    displayMessage(message, type = 'info') {
        this.messageElement.textContent = message; // Update the message area
        this.messageElement.className = ''; // Clear existing classes
        this.messageElement.classList.add(type); // Add the new type class
    }
    debounce(func, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    }
    async startMaze() {
        if(this.maze && this.maze.gameFinished){
            this.displayMessage('Game Over, Please reset and start Again', 'info');
            return ;
        }else if (this.maze && this.maze.started) {
            this.displayMessage('Maze already started', 'info');
            return;
        }else{
            this.displayMessage('Maze  started', 'info');
        }
        this.restart = false;
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        const blockedNodes = parseInt(document.getElementById('blockedNodes').value);
       
        if(!this.maze || ( this.maze.cols!==cols || this.maze.rows!==rows || this.maze.blockedNodes !==blockedNodes)){
            this.maze = new Maze(rows, cols, blockedNodes);
            this.renderMaze();
        }
        this.maze.started = true;
        const pathFound = await this.maze.findPath();

        if (pathFound) {
            this.maze.gameFinished = true;
            this.displayMessage('Victory! The rat has reached the destination.', 'success');
        } else if(!this.restart && !this.maze.isPaused){
            this.maze.gameFinished = true;
            this.displayMessage('No path found.', 'error');
        }
    }

    renderMaze() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        const blockedNodes = parseInt(document.getElementById('blockedNodes').value);
        if(!this.maze || ( this.maze.cols!==cols || this.maze.rows!==rows || this.maze.blockedNodes !==blockedNodes)){
            this.maze = new Maze(rows, cols, blockedNodes);
        }
        this.maze.mazeRendered = true;
        const container = document.getElementById('maze-container');
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.maze.cols}, 40px)`;

        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-row', row);
                cell.setAttribute('data-col', col);
                if (this.maze.grid[row][col] === 1) {
                    cell.classList.add('blocked'); // Add blocked class for obstacles
                } else if (row === this.maze.start.row && col === this.maze.start.col) {
                    cell.classList.add('start'); // Mark starting point
                } else if (row === this.maze.end.row && col === this.maze.end.col) {
                    cell.classList.add('end'); // Mark end point
                }

                container.appendChild(cell);
            }
        }

        this.resetPauseState(); // Reset the pause state whenever the maze is rendered
    }

    pauseMaze() {
        if(this.maze && this.maze.gameFinished){
            this.displayMessage('Game Over, Please Start Again', 'info');
            return ;
        }
        if (this.maze.isPaused) {
            this.resumeMaze()
            return;
        }

        this.maze.isPaused = true ; // Pause the maze
        this.displayMessage('Maze paused.', 'info');
        const pauseButton = document.getElementById('pause-resume-btn');
        pauseButton.textContent = 'Resume'; // Change button text
    }

    async  resumeMaze() {
        this.maze.isPaused = false;
        this.displayMessage('Maze resumed.', 'info');
        const pauseButton = document.getElementById('pause-resume-btn');
        pauseButton.textContent = 'Pause'; // Change button text
    }

    restartMaze() {

        if (!this.maze) {
            this.displayMessage('Please start the maze first.', 'error');
            return; // Prevent any further action
        }else if(this.maze && this.maze.started && !this.maze.gameFinished){
            this.displayMessage('Game is On Going. Please reset after Game Over!', 'error');
            return; // 
        }
        // Stop any ongoing maze finding process
        this.maze.started=false;
       
        this.maze.reset(); // Reset the maze
        this.renderMaze(); // Render the new maze
        this.restart=true;
        this.maze.gameFinished=false;
        this.displayMessage('Maze has been reset.', 'info'); // Display reset message

    }

    resetPauseState() {
        if (this.maze) {
            this.maze.isPaused = false; // Reset the pause state
            const pauseButton = document.getElementById('pause-resume-btn');
            pauseButton.textContent = 'Pause'; // Change button text back to Pause
        }
    }
}