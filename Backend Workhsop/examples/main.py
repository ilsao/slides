from typing import Annotated

from fastapi import FastAPI, HTTPException, Path, Query, Response, status
from pydantic import BaseModel, Field, StringConstraints

app = FastAPI(title="Course API", version="1.0.0")


CourseTitle = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=100),
]


class CourseCreate(BaseModel):
    title: CourseTitle
    capacity: int = Field(gt=0, le=500)


class CourseUpdate(BaseModel):
    # Fields may be omitted; this example treats null as no change.
    title: CourseTitle | None = Field(
        default=None,
        description="省略或 null 代表不修改",
    )
    capacity: int | None = Field(
        default=None,
        gt=0,
        le=500,
        description="省略或 null 代表不修改",
    )


class Course(CourseCreate):
    id: int


CourseId = Annotated[int, Path(ge=1, description="Course ID")]

courses: dict[int, Course] = {
    1: Course(id=1, title="Backend Workshop", capacity=30),
    2: Course(id=2, title="Database Training", capacity=25),
}
next_course_id = 3


def find_course(course_id: int) -> Course:
    course = courses.get(course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Course API is running"}


@app.get("/courses", response_model=list[Course])
def list_courses(
    q: str | None = Query(default=None, min_length=1, max_length=50),
    min_capacity: int | None = Query(default=None, ge=1),
) -> list[Course]:
    result = sorted(courses.values(), key=lambda course: course.id)

    if q is not None:
        keyword = q.casefold()
        result = [course for course in result if keyword in course.title.casefold()]

    if min_capacity is not None:
        result = [
            course for course in result if course.capacity >= min_capacity
        ]

    return result


@app.get("/courses/{course_id}", response_model=Course)
def get_course(course_id: CourseId) -> Course:
    return find_course(course_id)


@app.post(
    "/courses",
    response_model=Course,
    status_code=status.HTTP_201_CREATED,
)
def create_course(payload: CourseCreate, response: Response) -> Course:
    global next_course_id

    # Convert payload to a `dict` and pass it to `Course`.
    course = Course(id=next_course_id, **payload.model_dump())
    courses[course.id] = course
    next_course_id += 1
    response.headers["Location"] = f"/courses/{course.id}"
    return course


@app.patch("/courses/{course_id}", response_model=Course)
def update_course(course_id: CourseId, payload: CourseUpdate) -> Course:
    stored_course = find_course(course_id)
    # Ignore omitted fields and fields whose value is None.
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)

    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    updated_course = Course.model_validate(
        # Override stored_course values with changes.
        {**stored_course.model_dump(), **changes}
    )
    courses[course_id] = updated_course
    return updated_course


@app.delete(
    "/courses/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_course(course_id: CourseId) -> Response:
    find_course(course_id)
    del courses[course_id]
    return Response(status_code=status.HTTP_204_NO_CONTENT)
