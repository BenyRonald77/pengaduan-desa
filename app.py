"""Aplikasi Flask pengaduan masyarakat desa."""
from flask import Flask

from aduan.api import api_bp
from aduan.db import init_db
from aduan.pages import pages_bp
from aduan.publik import publik_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
    init_db()
    app.register_blueprint(api_bp)
    app.register_blueprint(publik_bp)
    app.register_blueprint(pages_bp)
    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5003, debug=False)
