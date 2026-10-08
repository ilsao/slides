def find_course(courses: list[dict], course_id: int) -> dict:
    for course in courses:
        if course["id"] == course_id:
            return course

    # Raise an exception if no matching course is found.
    raise ValueError(f"Course {course_id} not found")

courses = [
    {"id": 1, "title": "Backend Workshop", "capacity": 30},
    {"id": 2, "title": "Database Workshop", "capacity": 25},
]

try:
    # find_course returns a dict.
    course = find_course(courses, 3)
    print(course["title"])
except ValueError as error:
    print(error)

def filter_courses(
    courses: list[dict], minimum_capacity: int
) -> list[dict]:
    return [
        course
        for course in courses
        if course["capacity"] >= minimum_capacity
    ]
