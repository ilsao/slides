from fastapi import FastAPI

# Create a FastAPI application instance and set the API title.
app = FastAPI(title="Course API")


# Define the GET / API endpoint.
@app.get("/")
def root() -> dict[str, str]:
    # Return data in JSON format.
    return {"message": "Hello, backend!"}

courses = [
    {"id": 1, "title": "Backend Workshop", "capacity": 30},
    {"id": 2, "title": "Database Training", "capacity": 25},
]


@app.get("/courses")
def list_courses(q: str | None = None) -> list[dict]:
    # q is a query parameter.
    if q is None:
        return courses
    return [
        course
        for course in courses
        if q.lower() in course["title"].lower()
    ]


@app.get("/courses/{course_id}")
def get_course(course_id: int) -> dict:
    for course in courses:
        if course["id"] == course_id:
            return course
    return {"error": "Course not found"}
