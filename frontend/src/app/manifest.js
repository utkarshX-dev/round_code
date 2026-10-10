export default function manifest() {
  return {
    name: 'RoundCode by Round Table DTU',
    short_name: 'RoundCode',
    description: 'Weekly competitive programming challenges for Round Table DTU members.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090a0f',
    theme_color: '#090a0f',
    icons: [
      {
        src: '/roundtable-icon.png',
        sizes: '690x650',
        type: 'image/png',
      },
    ],
  };
}
