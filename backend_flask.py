from datetime import datetime, timedelta, timezone
from os import getenv
import logging
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from flask import Flask, request, jsonify
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:4200",
            "https://denis-almd.github.io"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

SESSION_DURATION = timedelta(hours=int(getenv("SESSION_DURATION_HOURS", 1)))


def get_app_timezone():
    tz_key = getenv("APP_TIMEZONE", "America/Sao_Paulo")
    try:
        return ZoneInfo(tz_key)
    except ZoneInfoNotFoundError:
        logger.warning(
            "Timezone '%s' nao encontrada. Usando fallback UTC-03:00. "
            "Instale o pacote 'tzdata' para suportar timezones IANA no Windows.",
            tz_key,
        )
        return timezone(timedelta(hours=-3))


APP_TIMEZONE = get_app_timezone()

def now_local() -> datetime:
    return datetime.now(APP_TIMEZONE)

state = {
    "taskId": "",
    "revealed": False,
    "host": "",
    "players": {},
    "updatedAt": now_local().isoformat(),
    "sessionStartedAt": None,
    "sessionExpiresAt": None,
}


def touch():
    state["updatedAt"] = now_local().isoformat()

def full_reset():
    state["taskId"] = ""
    state["revealed"] = False
    state["host"] = ""
    state["players"] = {}
    state["sessionStartedAt"] = None
    state["sessionExpiresAt"] = None
    touch()

def ensure_active_session():
    expires_at = state["sessionExpiresAt"]

    if not expires_at:
        return

    if now_local() >= datetime.fromisoformat(expires_at):
        full_reset()


def ensure_room_is_active():
    ensure_active_session()

    if not state["sessionStartedAt"]:
        return {
            "error": "Sessao expirada ou nao iniciada. Entre novamente para abrir uma nova sala.",
            "status": 409
        }
    return None


def start_session_if_needed(first_player_name: str):
    if state["sessionStartedAt"] is not None:
        return

    started_at = now_local()
    expires_at = started_at + SESSION_DURATION

    state["sessionStartedAt"] = started_at.isoformat()
    state["sessionExpiresAt"] = expires_at.isoformat()
    state["host"] = first_player_name
    touch()


def validate_name(name: str) -> tuple[bool, str]:
    name = name.strip() if isinstance(name, str) else ""

    if not name:
        return False, "Nome nao pode estar vazio"
    if len(name) < 1 or len(name) > 50:
        return False, "Nome deve ter entre 1 e 50 caracteres"

    allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_àáâãäèéêëìíîïòóôõöùúûüç')
    if not all(c in allowed_chars for c in name):
        return False, "Nome contém caracteres inválidos"

    return True, name


def ensure_player_in_room(player_name: str) -> tuple[bool, str, int]:
    error = ensure_room_is_active()
    if error:
        return False, error["error"], error["status"]

    if player_name not in state["players"]:
        return False, "Jogador nao esta na sala. Entre novamente.", 404

    return True, "", 200


@app.route('/api/state', methods=['GET'])
def get_state():
    ensure_active_session()

    response = {
        "taskId": state["taskId"],
        "revealed": state["revealed"],
        "host": state["host"],
        "updatedAt": state["updatedAt"],
        "sessionStartedAt": state["sessionStartedAt"],
        "sessionExpiresAt": state["sessionExpiresAt"],
        "players": {},
    }

    for player_name, player_data in state["players"].items():
        response["players"][player_name] = {
            "voted": player_data["voted"],
            "card": player_data["card"] if state["revealed"] else None,
        }

    return jsonify(response)


@app.route('/api/join', methods=['POST'])
def join():
    data = request.get_json()
    name = data.get('name', '') if data else ''

    is_valid, validated_name = validate_name(name)
    if not is_valid:
        return jsonify({"error": validated_name}), 400

    name = validated_name

    ensure_active_session()
    logger.info(f"Player joining: {name}")

    is_first_player = len(state["players"]) == 0

    if is_first_player:
        start_session_if_needed(name)

    if name not in state["players"]:
        state["players"][name] = {
            "voted": False,
            "card": None,
        }

    if not state["host"]:
        state["host"] = name

    touch()

    return jsonify({
        "ok": True,
        "isHost": state["host"] == name,
        "host": state["host"],
        "sessionStartedAt": state["sessionStartedAt"],
        "sessionExpiresAt": state["sessionExpiresAt"],
    })


@app.route('/api/task', methods=['POST'])
def set_task():
    data = request.get_json()
    task_id = data.get('taskId', '') if data else ''

    if not task_id or len(task_id) > 200:
        return jsonify({"error": "TaskId inválido"}), 400

    error = ensure_room_is_active()
    if error:
        return jsonify({"error": error["error"]}), error["status"]

    state["taskId"] = task_id
    state["revealed"] = False

    for player in state["players"].values():
        player["voted"] = False
        player["card"] = None

    touch()

    return jsonify({
        "ok": True,
        "message": "Task definida",
        "sessionExpiresAt": state["sessionExpiresAt"],
    })


@app.route('/api/vote', methods=['POST'])
def vote():
    data = request.get_json()
    name = data.get('name', '') if data else ''
    card = data.get('card', '') if data else ''

    is_valid, validated_name = validate_name(name)
    name = validated_name if is_valid else ''

    success, error_msg, status_code = ensure_player_in_room(name)
    if not success:
        return jsonify({"error": error_msg}), status_code

    if state["revealed"]:
        return jsonify({"error": "Rodada ja foi revelada. Aguarde a proxima rodada."}), 409

    state["players"][name]["voted"] = True
    state["players"][name]["card"] = card
    touch()

    return jsonify({
        "ok": True,
        "message": "Voto registrado",
        "sessionExpiresAt": state["sessionExpiresAt"],
    })


@app.route('/api/reveal', methods=['POST'])
def reveal():
    data = request.get_json()
    name = data.get('name', '') if data else ''

    is_valid, validated_name = validate_name(name)
    name = validated_name if is_valid else ''

    success, error_msg, status_code = ensure_player_in_room(name)
    if not success:
        return jsonify({"error": error_msg}), status_code

    if name != state["host"]:
        return jsonify({
            "error": f"Apenas o Scrum Master pode revelar votos. Host atual: {state['host'] or 'nenhum'}"
        }), 403

    state["revealed"] = True
    logger.info(f"Votos revelados por {name}")
    touch()

    return jsonify({
        "ok": True,
        "message": "Votos revelados",
        "sessionExpiresAt": state["sessionExpiresAt"],
    })


@app.route('/api/reset', methods=['POST'])
def reset():
    data = request.get_json()
    name = data.get('name', '') if data else ''

    is_valid, validated_name = validate_name(name)
    name = validated_name if is_valid else ''

    success, error_msg, status_code = ensure_player_in_room(name)
    if not success:
        return jsonify({"error": error_msg}), status_code

    if name != state["host"]:
        return jsonify({"error": "Apenas o Scrum Master pode resetar a rodada"}), 403

    state["revealed"] = False

    for player in state["players"].values():
        player["voted"] = False
        player["card"] = None

    logger.info(f"Rodada resetada por {name}")
    touch()

    return jsonify({
        "ok": True,
        "message": "Rodada resetada",
        "sessionExpiresAt": state["sessionExpiresAt"],
    })


@app.route('/api/set-host', methods=['POST'])
def set_host():
    data = request.get_json()
    name = data.get('name', '') if data else ''
    new_host = data.get('newHost', '') if data else ''

    is_valid, validated_name = validate_name(name)
    name = validated_name if is_valid else ''

    success, error_msg, status_code = ensure_player_in_room(name)
    if not success:
        return jsonify({"error": error_msg}), status_code

    if name != state["host"]:
        return jsonify({"error": "Apenas o Scrum Master atual pode transferir a facilitacao"}), 403

    if new_host not in state["players"]:
        return jsonify({"error": "Jogador nao encontrado"}), 400

    state["host"] = new_host
    logger.info(f"Host transferido de {name} para {new_host}")
    touch()

    return jsonify({
        "ok": True,
        "message": "Facilitacao transferida",
        "host": state["host"],
        "sessionExpiresAt": state["sessionExpiresAt"],
    })


@app.route('/api/leave', methods=['POST'])
def leave():
    data = request.get_json()
    name = data.get('name', '') if data else ''

    is_valid, validated_name = validate_name(name)
    name = validated_name if is_valid else ''

    ensure_active_session()

    if name not in state["players"]:
        return jsonify({"error": "Jogador nao encontrado na sala"}), 404

    del state["players"][name]
    logger.info(f"Player left: {name}")

    if state["host"] == name:
        if state["players"]:
            state["host"] = next(iter(state["players"].keys()))
            logger.info(f"Host transferido para {state['host']} (substituindo {name})")
        else:
            full_reset()
            logger.info("Sala vazia. Sessão resetada.")

    touch()

    return jsonify({
        "ok": True,
        "message": "Saiu da sala",
        "host": state["host"],
        "sessionExpiresAt": state["sessionExpiresAt"],
    })


@app.route('/api/admin/reset-all', methods=['POST'])
def reset_all():
    logger.warning("Estado global resetado via /api/admin/reset-all")
    full_reset()
    return jsonify({
        "ok": True,
        "message": "Estado global resetado"
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint não encontrado"}), 404


@app.errorhandler(500)
def server_error(error):
    logger.error(f"Erro interno: {error}")
    return jsonify({"error": "Erro interno do servidor"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=False)