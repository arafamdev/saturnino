export const chapters = [
  {
    id: 'introduction',
    group: 0,
    number: '01',
  },
  {
    id: 'quick-start',
    group: 0,
    number: '02',
  },
  {
    id: 'installation',
    group: 0,
    number: '03',
  },
  {
    id: 'projects',
    group: 1,
    number: '04',
  },
  {
    id: 'tasks',
    group: 1,
    number: '05',
  },
  {
    id: 'kanban',
    group: 1,
    number: '06',
  },
  {
    id: 'dashboard',
    group: 1,
    number: '07',
  },
  {
    id: 'customization',
    group: 1,
    number: '08',
  },
  {
    id: 'productivity',
    group: 1,
    number: '09',
  },
  {
    id: 'local-first',
    group: 2,
    number: '10',
  },
  {
    id: 'offline',
    group: 2,
    number: '11',
  },
  {
    id: 'backup',
    group: 2,
    number: '12',
  },
  {
    id: 'limitations',
    group: 3,
    number: '13',
  },
  {
    id: 'future',
    group: 3,
    number: '14',
  },
  {
    id: 'faq',
    group: 3,
    number: '15',
  },
]

export function chapterPath(id) {
  return id === 'introduction' ? '/guide' : `/guide/${id}`
}
