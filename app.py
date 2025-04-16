from flask import Flask, render_template, request, jsonify, session
from wumpus_logic import WumpusWorld, WumpusSolverAgent
import json
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for session management

# Store active games in memory (in production, use a database)
active_games = {}

@app.route('/')
def index():
    """Render the main page with the Wumpus World game interface"""
    return render_template('index.html')

@app.route('/solver', methods=['GET'])
def solver_page():
    """Render the AI solver explanation page"""
    return render_template('solver.html')

@app.route('/initialize', methods=['POST'])
def initialize_world():
    """Initialize a new Wumpus World with the provided configuration"""
    try:
        data = request.json
        size = int(data.get('size', 4))
        wumpus_pos = data.get('wumpus_pos', None)
        gold_pos = data.get('gold_pos', None)
        pit_positions = data.get('pit_positions', None)
        
        # Create new game instance
        game = WumpusWorld(size=size, wumpus_pos=wumpus_pos, 
                          gold_pos=gold_pos, pit_positions=pit_positions)
        
        # Generate unique game ID
        game_id = os.urandom(8).hex()
        active_games[game_id] = game
        
        return jsonify({
            'status': 'success',
            'world_id': game_id,
            'config': {
                'size': size,
                'wumpus_pos': game.wumpus_pos,
                'gold_pos': game.gold_pos,
                'pit_positions': game.pit_positions
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/move', methods=['POST'])
def move_agent():
    """Process a move command from the user"""
    try:
        data = request.json
        world_id = data.get('world_id')
        direction = data.get('direction')  # 'up', 'down', 'left', 'right'
        
        if world_id not in active_games:
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404
            
        game = active_games[world_id]
        result = game.move_agent(direction)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/grab', methods=['POST'])
def grab_gold():
    """Process a grab gold command"""
    try:
        data = request.json
        world_id = data.get('world_id')
        
        if world_id not in active_games:
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404
            
        game = active_games[world_id]
        result = game.grab_gold()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/shoot', methods=['POST'])
def shoot_arrow():
    """Process a shoot arrow command"""
    try:
        data = request.json
        world_id = data.get('world_id')
        
        if world_id not in active_games:
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404
            
        game = active_games[world_id]
        result = game.shoot_arrow()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/solve', methods=['POST'])
def solve_world():
    """Run the AI solver on the current world state"""
    try:
        data = request.json
        world_id = data.get('world_id')
        
        if world_id not in active_games:
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404
            
        game = active_games[world_id]
        solver = WumpusSolverAgent(game)
        solution = solver.solve()
        
        return jsonify({
            'status': 'success',
            'solution': solution
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True) 