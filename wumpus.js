// Global variables
let worldId = null;
let gridSize = 4;
let gameBoard = null;
let currentPosition = null;
let hasGold = false;
let gameOver = false;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize event listeners
    document.getElementById('initialize-btn').addEventListener('click', initializeWorld);
    document.getElementById('solve-btn').addEventListener('click', showSolution);
    document.getElementById('move-up').addEventListener('click', () => moveAgent('up'));
    document.getElementById('move-down').addEventListener('click', () => moveAgent('down'));
    document.getElementById('move-left').addEventListener('click', () => moveAgent('left'));
    document.getElementById('move-right').addEventListener('click', () => moveAgent('right'));
    
    // Initialize modal close button
    const modal = document.getElementById('solution-modal');
    const closeBtn = document.querySelector('.close-btn');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

/**
 * Initialize a new Wumpus World
 */
async function initializeWorld() {
    try {
        // Reset game state
        worldId = null;
        hasGold = false;
        gameOver = false;
        
        // Get configuration values
        gridSize = parseInt(document.getElementById('grid-size').value);
        const wumpusPos = parsePosition(document.getElementById('wumpus-pos').value);
        const goldPos = parsePosition(document.getElementById('gold-pos').value);
        const pitPositions = parsePitPositions(document.getElementById('pit-positions').value);
        
        // Update status
        setStatusMessage('Initializing world...');
        
        // Send request to server
        const response = await fetch('/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                size: gridSize,
                wumpus_pos: wumpusPos,
                gold_pos: goldPos,
                pit_positions: pitPositions
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            worldId = data.world_id;
            
            // Initialize the game board
            initializeGameBoard(gridSize);
            
            // Enable movement controls
            enableMovementControls();
            
            // Enable solve button
            document.getElementById('solve-btn').disabled = false;
            
            // Set initial position
            currentPosition = [0, 0]; // Starting at bottom-left
            updateAgentPosition(currentPosition);
            
            setStatusMessage('World initialized. You start at the bottom-left corner. Find the gold and return to start!');
        } else {
            setStatusMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        setStatusMessage(`Error: ${error.message}`);
        console.error('Error initializing world:', error);
    }
}

/**
 * Initialize the game board with the specified size
 */
function initializeGameBoard(size) {
    const board = document.getElementById('game-board');
    
    // Clear existing board
    board.innerHTML = '';
    
    // Set grid columns based on size
    board.style.gridTemplateColumns = `repeat(${size}, 80px)`;
    board.style.gridTemplateRows = `repeat(${size}, 80px)`;
    
    // Create cells
    for (let row = size - 1; row >= 0; row--) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${row}-${col}`;
            
            // Add cell content div
            const content = document.createElement('div');
            content.className = 'cell-content';
            cell.appendChild(content);
            
            // Add cell percept div
            const percept = document.createElement('div');
            percept.className = 'cell-percept';
            cell.appendChild(percept);
            
            board.appendChild(cell);
        }
    }
}

/**
 * Move the agent in the specified direction
 */
async function moveAgent(direction) {
    if (gameOver) return;
    
    try {
        // Map direction to dx, dy
        let dx = 0, dy = 0;
        
        switch (direction) {
            case 'up':
                dx = 1;
                dy = 0;
                break;
            case 'down':
                dx = -1;
                dy = 0;
                break;
            case 'left':
                dx = 0;
                dy = -1;
                break;
            case 'right':
                dx = 0;
                dy = 1;
                break;
        }
        
        // Send move request to server
        const response = await fetch('/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                world_id: worldId,
                direction: direction
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update agent position
            currentPosition = data.new_position;
            updateAgentPosition(currentPosition);
            
            // Update percepts
            document.getElementById('agent-percepts').textContent = data.percepts.join(', ') || 'None';
            
            // Update score
            document.getElementById('agent-score').textContent = data.score;
            
            // Update status message
            setStatusMessage(data.message);
            
            // Check if game over
            if (data.game_over) {
                gameOver = true;
                
                if (data.won) {
                    setStatusMessage('Congratulations! You won the game!');
                    // Disable movement controls
                    disableMovementControls();
                } else {
                    setStatusMessage('Game over! ' + data.message);
                    // Disable movement controls
                    disableMovementControls();
                }
            }
            
            // Check for gold
            if (data.has_gold) {
                hasGold = true;
                document.getElementById('gold-status').textContent = 'Found! 🏆';
                document.getElementById('gold-status').style.color = 'gold';
            }
        } else {
            setStatusMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        setStatusMessage(`Error: ${error.message}`);
        console.error('Error moving agent:', error);
    }
}

/**
 * Show the AI solution
 */
async function showSolution() {
    try {
        setStatusMessage('Calculating AI solution...');
        
        const response = await fetch('/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                world_id: worldId
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Display the solution in the modal
            const solutionSteps = document.getElementById('solution-steps');
            solutionSteps.innerHTML = '';
            
            data.solution.forEach((step, index) => {
                const stepElement = document.createElement('div');
                stepElement.className = 'solution-step';
                stepElement.textContent = `${index + 1}. ${step}`;
                solutionSteps.appendChild(stepElement);
            });
            
            // Show the modal
            const modal = document.getElementById('solution-modal');
            modal.style.display = 'flex';
            
            setStatusMessage('Solution displayed.');
        } else {
            setStatusMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        setStatusMessage(`Error: ${error.message}`);
        console.error('Error getting solution:', error);
    }
}

/**
 * Update the agent's position on the board
 */
function updateAgentPosition(position) {
    // Clear all cells of agent
    const cells = document.querySelectorAll('.cell-content');
    cells.forEach(cell => {
        cell.innerHTML = '';
    });
    
    // Add agent to new position
    const [row, col] = position;
    const cell = document.querySelector(`#cell-${row}-${col} .cell-content`);
    
    const agent = document.createElement('i');
    agent.className = 'fas fa-user agent';
    cell.appendChild(agent);
    
    // Update position display
    document.getElementById('agent-position').textContent = `(${col}, ${row})`;
}

/**
 * Set the status message
 */
function setStatusMessage(message) {
    document.getElementById('status-message').textContent = message;
}

/**
 * Enable movement controls
 */
function enableMovementControls() {
    document.getElementById('move-up').disabled = false;
    document.getElementById('move-down').disabled = false;
    document.getElementById('move-left').disabled = false;
    document.getElementById('move-right').disabled = false;
}

/**
 * Disable movement controls
 */
function disableMovementControls() {
    document.getElementById('move-up').disabled = true;
    document.getElementById('move-down').disabled = true;
    document.getElementById('move-left').disabled = true;
    document.getElementById('move-right').disabled = true;
}

/**
 * Parse position string into [x, y] coordinates
 */
function parsePosition(posString) {
    try {
        const [x, y] = posString.split(',').map(coord => parseInt(coord.trim()));
        return [x, y];
    } catch (error) {
        console.error('Error parsing position:', error);
        return [0, 0];
    }
}

/**
 * Parse pit positions string into array of [x, y] coordinates
 */
function parsePitPositions(posString) {
    try {
        return posString.split(';')
            .filter(pos => pos.trim().length > 0)
            .map(pos => {
                const [x, y] = pos.split(',').map(coord => parseInt(coord.trim()));
                return [x, y];
            });
    } catch (error) {
        console.error('Error parsing pit positions:', error);
        return [];
    }
} 