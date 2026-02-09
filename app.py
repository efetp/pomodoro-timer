"""
Pomodoro Timer — Flask Backend
Run with: python app.py
Then open http://localhost:5000 in your browser
"""

import json
import os
from datetime import datetime, date
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "sessions.json")

# --- Data helpers ---

def load_data() -> dict:
    """Load todos and sessions from the JSON file."""
    if not os.path.exists(DATA_FILE):
        return {"todos": [], "sessions": []}
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    """Save todos and sessions to the JSON file."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


# --- Routes ---

@app.route("/")
def index():
    """Serve the main page."""
    return render_template("index.html")


@app.route("/api/todos", methods=["GET"])
def get_todos():
    """Return all todos."""
    data = load_data()
    return jsonify(data["todos"])


@app.route("/api/todos", methods=["POST"])
def add_todo():
    """Add a new todo. Expects JSON: {name, estimated_minutes}"""
    data = load_data()
    todo = request.get_json()
    todo["id"] = int(datetime.now().timestamp() * 1000)
    todo["completed"] = False
    todo["created_at"] = datetime.now().isoformat()
    data["todos"].append(todo)
    save_data(data)
    return jsonify(todo), 201


@app.route("/api/todos/<int:todo_id>", methods=["PATCH"])
def update_todo(todo_id):
    """Toggle a todo's completed status or update it."""
    data = load_data()
    for todo in data["todos"]:
        if todo["id"] == todo_id:
            updates = request.get_json()
            todo.update(updates)
            save_data(data)
            return jsonify(todo)
    return jsonify({"error": "Todo not found"}), 404


@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    """Delete a todo."""
    data = load_data()
    data["todos"] = [t for t in data["todos"] if t["id"] != todo_id]
    save_data(data)
    return jsonify({"ok": True})


@app.route("/api/sessions", methods=["POST"])
def log_session():
    """Log a completed pomodoro session. Expects JSON: {mode, task, work_minutes}"""
    data = load_data()
    session = request.get_json()
    session["completed_at"] = datetime.now().isoformat()
    session["date"] = date.today().isoformat()
    data["sessions"].append(session)
    save_data(data)
    return jsonify(session), 201


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Return today's stats."""
    data = load_data()
    today = date.today().isoformat()
    today_sessions = [s for s in data["sessions"] if s.get("date") == today]

    total_minutes = sum(s.get("work_minutes", 0) for s in today_sessions)
    return jsonify({
        "total_pomodoros": len(today_sessions),
        "total_minutes": total_minutes,
        "sessions": today_sessions,
    })


if __name__ == "__main__":
    print("\n  Pomodoro Timer running at: http://localhost:5000\n")
    app.run(debug=True, port=5000)
