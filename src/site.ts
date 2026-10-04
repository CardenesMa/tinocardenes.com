// Site-wide facts: who this is, how to reach them, and the "edition" details
// printed on the cover and in each page's footer.

export const site = {
  name: 'Tino Cardenes',
  url: 'https://tinocardenes.com',
  title: 'Tino Cardenes · Pianist, Composer, Computer Scientist',
  description:
    'Classical and jazz pianist, composer, and computer scientist based in Pittsburgh. Recordings, lead sheets, software, and projects that combine music and computation.',
  email: 'cardenestino@gmail.com',
  socials: [
    { label: 'YouTube', href: 'https://www.youtube.com/@tinocardenes' },
    { label: 'Instagram', href: 'https://www.instagram.com/tinocardenes/' },
    { label: 'GitHub', href: 'https://github.com/CardenesMa' },
  ],
  downloads: {
    bio: '/bio.pdf',
    resume: '/resume.pdf',
    photo: '/headshot.jpg',
  },
  // The site presented as a printed score.
  edition: {
    work: 'Collected Works',
    scoring: 'for Piano & Computer',
    roles: ['Pianist', 'Composer', 'Computer Scientist'],
    place: 'Pittsburgh, Pennsylvania',
    year: 2026,
    plate: 'T.C. 2026',
    marking: 'Con spirito',
  },
} as const;
