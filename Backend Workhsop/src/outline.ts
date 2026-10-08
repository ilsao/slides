import { slides } from './deck';

export type OutlineSection = { id: string; title: string; slideIds: number[] };
export type OutlineChapter = OutlineSection & { children: OutlineSection[] };

// Notion heading order is the presentation order. Chapters without direct
// content have no slideIds, so they remain hierarchy labels instead of rows.
export const outline: OutlineChapter[] = [
  { id: 'syllabus', title: 'Syllabus', slideIds: [], children: [
    // The opening question and its expanded flow introduce the first learning
    // goals. Assigning them here keeps the Notion sequence visible from page 2.
    { id: 'goals', title: 'Learning Goals', slideIds: [1, 2, 3] },
    { id: 'schedule', title: 'Schedule', slideIds: [4] },
    { id: 'prerequisites', title: 'Prerequisites', slideIds: [11001, 12001, 13001, 14001, 15001] },
  ] },
  { id: 'python', title: 'Recap: Python', slideIds: [6], children: [
    { id: 'functions', title: 'Function', slideIds: [7] },
    { id: 'collections', title: 'List, Dictionary, and Exception', slideIds: [8, 9] },
    { id: 'python-exercise', title: 'Exercise: Filter Courses', slideIds: [18001] },
  ] },
  { id: 'web', title: 'Backend & Web Overview', slideIds: [], children: [
    { id: 'client-server', title: 'Client-Server Architecture', slideIds: [10, 11] },
    { id: 'responsibilities', title: 'Frontend, Backend, and Database', slideIds: [12] },
    { id: 'http', title: 'HTTP Request and Response', slideIds: [13, 14, 15, 16] },
    { id: 'api', title: 'API', slideIds: [17, 23001] },
  ] },
  { id: 'rest', title: 'RESTful API Design', slideIds: [], children: [
    { id: 'what-is-rest', title: 'What is REST', slideIds: [29, 30, 31, 33] },
  ] },
  { id: 'fastapi', title: 'Introduction to FastAPI', slideIds: [], children: [
    { id: 'first-app', title: 'Your First FastAPI Application', slideIds: [18, 26001] },
    { id: 'routes', title: 'Routes and Endpoints', slideIds: [19, 27001, 27007, 21, 27019, 20] },
    { id: 'validation', title: 'Pydantic Validation', slideIds: [22, 23, 28010, 28023, 28036, 24, 29001, 29038, 29047, 29054, 29059, 29072, 29078, 25, 26, 29108, 29116, 30001] },
    { id: 'swagger', title: 'Swagger UI', slideIds: [27] },
  ] },
  { id: 'database', title: 'Database', slideIds: [35, 36], children: [
    { id: 'relational', title: 'Relational Model', slideIds: [37] },
    { id: 'schema', title: 'Schema, Table, Row, Column', slideIds: [34001] },
    { id: 'keys', title: 'Primary Key, Foreign Key, Constraints', slideIds: [38, 39] },
    { id: 'sql', title: 'SQL Basic', slideIds: [40, 36001, 37001, 38001, 39001, 41, 40001, 41001, 41016, 41024, 42, 41047, 41059, 41067, 41077, 41091, 41095, 41109, 41111, 41118, 41132, 42001, 43001, 43] },
    { id: 'sql-exercise', title: 'Exercise: Write a Query', slideIds: [44001] },
  ] },
  { id: 'next', title: "What's Next?", slideIds: [44, 47], children: [] },
];

export const specialOutline: OutlineSection[] = [
  { id: 'break', title: '休息', slideIds: [28] },
  { id: 'qa', title: '問答', slideIds: [48] },
];
export const hasOutline = (id: number) => ![49, 28, 48].includes(id);
export const chapterContains = (chapter: OutlineChapter, id: number) => chapter.slideIds.includes(id) || chapter.children.some(section => section.slideIds.includes(id));
export function outlineTarget(entry: OutlineSection | OutlineChapter): number {
  const ids = [...entry.slideIds, ...('children' in entry ? entry.children.flatMap(child => child.slideIds) : [])];
  return slides.find(slide => ids.includes(slide.id))!.id;
}

// Projection follows one focus at a time; the handout source retains the full tree.
export const progressItems = outline.flatMap(chapter => [
  ...(chapter.slideIds.some(hasOutline) ? [{ id: chapter.id, title: chapter.title, slideIds: chapter.slideIds }] : []),
  ...chapter.children,
].map(section => ({ ...section, chapterId: chapter.id, chapterTitle: chapter.title, target: outlineTarget(section) })));

export function progressIndex(slideId: number) {
  return progressItems.findIndex(item => item.slideIds.includes(slideId));
}
