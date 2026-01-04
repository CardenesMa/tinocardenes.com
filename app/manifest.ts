import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tino Cardenes - Pianist, Music Technologist',
    short_name: 'Tino Cardenes',
    description: 'Professional musician and computer scientist specializing in music technology, jazz piano, and media production.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/headshot.avif',
        sizes: 'any',
        type: 'image/avif',
      },
    ],
  }
}
