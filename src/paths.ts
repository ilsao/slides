/** Resolve an application path beneath Vite's deployment base. */
export function sitePath(path = ''): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

/** Keep route matching independent of the repository's Pages subdirectory. */
export function routePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = base && (pathname === base || pathname.startsWith(`${base}/`))
    ? pathname.slice(base.length)
    : pathname;
  return path.replace(/\/$/, '') || '/';
}
