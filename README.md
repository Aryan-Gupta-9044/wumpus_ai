# AI Solvers - Wumpus World Web Application

A web-based implementation of the Wumpus World game with an AI solver, built using Flask.

## Features

- Interactive Wumpus World game interface
- AI solver that demonstrates knowledge-based reasoning
- Real-time game state updates
- Responsive web design

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-solvers.git
cd ai-solvers
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure

- `app.py` - Main Flask application
- `wumpus_logic.py` - Core game logic
- `templates/` - HTML templates
  - `index.html` - Main game interface
  - `solver.html` - AI solver explanation
- `static/` - Static assets
  - `css/` - Stylesheets
  - `js/` - JavaScript files
  - `images/` - Game assets

## How to Play

1. Start a new game by clicking "New Game"
2. Use the arrow keys or click buttons to move the agent
3. Collect gold and avoid the Wumpus and pits
4. Try the AI solver to see how an intelligent agent would play

## License

This project is licensed under the MIT License - see the LICENSE file for details. 