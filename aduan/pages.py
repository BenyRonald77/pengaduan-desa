"""Halaman UI."""
from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def lapor():
    return render_template("lapor.html")


@pages_bp.get("/lacak")
def lacak():
    return render_template("lacak.html")


@pages_bp.get("/publik")
def publik():
    return render_template("publik.html")


@pages_bp.get("/admin")
def admin():
    return render_template("admin.html")
