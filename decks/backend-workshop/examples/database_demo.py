import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).with_name("workshop.db")

# Define the schemas for the three tables.
SCHEMA = """
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY,
    -- trim removes leading and trailing whitespace from a string.
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    email TEXT NOT NULL UNIQUE,
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    capacity INTEGER NOT NULL
        CHECK (typeof(capacity) = 'integer' AND capacity BETWEEN 1 AND 500),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
    member_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'enrolled'
        CHECK (status IN ('enrolled', 'completed')),
    enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Use (member_id, course_id) as the PK to prevent a member from enrolling in the same course twice.
    PRIMARY KEY (member_id, course_id),
    -- DELETE CASCADE deletes this row when the referenced parent row is deleted.
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
"""

# Create a database connection.
connection = sqlite3.connect(DATABASE_PATH)
# Access row values by column name with row["attribute"], instead of only by index with row[int].
connection.row_factory = sqlite3.Row
# Enable FK checks; execute runs a single SQL statement.
connection.execute("PRAGMA foreign_keys = ON")
# Execute multiple SQL statements.
connection.executescript(SCHEMA)

try:
    # Ensure atomicity: SQL statements inside the with block succeed or fail together.
    with connection:
        connection.execute(
            """
            -- ? is a placeholder for a value supplied by Python.
            INSERT INTO members (id, name, email) VALUES (?, ?, ?)
            -- If id conflicts, do nothing to preserve uniqueness.
            ON CONFLICT(id) DO NOTHING
            """,
            (1, "王小明", "ming@example.com"),
        )
        connection.execute(
            """
            INSERT INTO courses (id, title, capacity) VALUES (?, ?, ?)
            ON CONFLICT(id) DO NOTHING
            """,
            (1, "Backend Workshop", 30),
        )

    member = connection.execute(
        "SELECT id, name, email FROM members WHERE id = ?",
        (1,),
    ).fetchone() # fetchone retrieves one row.
    course = connection.execute(
        "SELECT id, title, capacity FROM courses WHERE id = ?",
        (1,),
    ).fetchone()
    assert member is not None and course is not None

    # Return 1 if a row matches both member_id and course_id.
    existing_enrollment = connection.execute(
        """
        SELECT 1 FROM enrollments
        WHERE member_id = ? AND course_id = ?
        """,
        (member["id"], course["id"]),
    ).fetchone()
    if existing_enrollment is None:
        with connection:
            connection.execute(
                """
                INSERT INTO enrollments (member_id, course_id)
                VALUES (?, ?)
                """,
                (member["id"], course["id"]),
            )

    # READ: JOIN the three tables to retrieve complete enrollment information.
    rows = connection.execute(
        """
        SELECT m.name, c.title, c.capacity, e.status
        FROM enrollments AS e
        JOIN members AS m ON m.id = e.member_id
        JOIN courses AS c ON c.id = e.course_id
        WHERE c.id = ?
        ORDER BY m.id
        """,
        (course["id"],),
    ).fetchall() # fetchall retrieves all rows returned by the query.

    for row in rows:
        print(dict(row))

    with connection:
        cursor = connection.execute(
            "UPDATE courses SET capacity = ? WHERE id = ?",
            (35, course["id"]),
        )
    print(f"updated rows: {cursor.rowcount}")

    # DELETE: Create a temporary record, then demonstrate deleting it.
    with connection:
        cursor = connection.execute(
            "INSERT INTO courses (title, capacity) VALUES (?, ?)",
            ("Temporary Course", 1),
        )
        # lastrowid retrieves the id of the last inserted row.
        temporary_course_id = cursor.lastrowid
        cursor = connection.execute(
            "DELETE FROM courses WHERE id = ?",
            (temporary_course_id,),
        )
    print(f"deleted rows: {cursor.rowcount}")

except sqlite3.IntegrityError as error:
    print(f"data violates a constraint: {error}")
finally:
    connection.close()
