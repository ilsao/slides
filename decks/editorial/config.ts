import { fadeTransition } from '../../src/presentation';

export const editorialConfig = {
  id: 'template-editorial', title: 'Editorial', version: 1,
  description: '紙色、襯線與留白。像編輯一本雜誌。',
  size: { width: 1600, height: 900 },
  palette: { paper: '#f4eee3', ink: '#652c3d', muted: '#826e70' },
  motion: { duration: .75 },
  transition: fadeTransition(.55),
};
