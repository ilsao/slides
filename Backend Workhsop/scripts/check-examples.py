"""Verify the published lesson examples without starting a backend."""
import ast
import json
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import contextlib
import io
import runpy
from typing import get_type_hints
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for path in (ROOT / "examples").glob("*.py"):
    ast.parse(path.read_text(encoding="utf-8"), filename=str(path))

# Resolve annotations at runtime as well as parsing: removed aliases must not
# survive in the filter exercise's return annotation.
with contextlib.redirect_stdout(io.StringIO()) as recap_output:
    recap = runpy.run_path(str(ROOT / "examples" / "python_recap.py"))
assert recap_output.getvalue().strip() == "Course 3 not found"
courses = recap["courses"]
assert recap["find_course"](courses, 1) is courses[0]
try:
    recap["find_course"](courses, 3)
except ValueError as error:
    assert str(error) == "Course 3 not found"
else:
    raise AssertionError("Missing course must raise ValueError")
assert get_type_hints(recap["find_course"])["return"] == dict
assert get_type_hints(recap["filter_courses"])["return"] == list[dict]
assert recap["filter_courses"](courses, 25) == courses
assert recap["filter_courses"](courses, 30) == [courses[0]]
assert recap["filter_courses"](courses, 31) == []
assert recap["filter_courses"]([], 0) == []

with tempfile.TemporaryDirectory(prefix="backend-workshop-") as temporary:
    demo = Path(temporary) / "database_demo.py"
    shutil.copy2(ROOT / "examples" / "database_demo.py", demo)
    outputs = [
        subprocess.check_output([sys.executable, str(demo)], text=True, encoding="utf-8",
                                env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"})
        for _ in range(2)
    ]
    assert "'capacity': 30" in outputs[0], outputs[0]
    assert "'capacity': 35" in outputs[1], outputs[1]
    assert all("updated rows: 1" in out and "deleted rows: 1" in out for out in outputs)
    db = sqlite3.connect(Path(temporary) / "workshop.db")
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    for table in ("members", "courses", "enrollments"):
        assert db.execute("SELECT count(*) FROM " + table).fetchone()[0] == 1
    for sql, params in [
        ("INSERT INTO courses(title,capacity) VALUES (?,?)", ("Invalid", 0)),
        ("INSERT INTO courses(title,capacity) VALUES (?,?)", ("Invalid", "abc")),
        ("INSERT INTO enrollments(member_id,course_id) VALUES (?,?)", (999, 1)),
        ("INSERT INTO enrollments(member_id,course_id) VALUES (?,?)", (1, 1)),
    ]:
        try:
            with db:
                db.execute(sql, params)
        except sqlite3.IntegrityError:
            pass
        else:
            raise AssertionError("Constraint did not reject " + sql)
    try:
        with db:
            db.execute("INSERT INTO members(id,name,email) VALUES (2,'Test','test@example.com')")
            db.execute("INSERT INTO courses(title,capacity) VALUES ('Invalid',0)")
    except sqlite3.IntegrityError:
        pass
    assert db.execute("SELECT count(*) FROM members WHERE id=2").fetchone()[0] == 0
    source = json.loads((ROOT / "sources" / "notion-code.json").read_text(encoding="utf-8"))
    namespace = {"connection": db}
    exec(source[33]["code"], namespace)
    assert [row["capacity"] for row in namespace["courses"]] == [35]
    db.close()

print("PASS: 4 Python examples parse; Python lookup, exceptions, type hints and filtering; SQLite repeat run, constraints, rollback and SQL exercise.")
