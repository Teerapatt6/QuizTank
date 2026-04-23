require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

async function mockData() {
  try {
    console.log('Mocking Categories and Languages...');

    // Categories
    const categories = ['Science', 'History', 'Mathematics', 'Geography', 'Technology', 'Pop Culture', 'Literature', 'Art', 'Sports'];
    await pool.query(
      `INSERT INTO options (key, value) VALUES ('categories', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(categories)]
    );

    // Languages
    const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Thai', 'Chinese'];
    await pool.query(
      `INSERT INTO options (key, value) VALUES ('languages', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(languages)]
    );

    console.log('Mocking Maps...');

    // Maps
    const maps = [
      {
        name: 'Grassland Arena',
        description: 'A basic green arena with open spaces and scattered bushes.',
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        music_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_24a2c07936.mp3?filename=ambient-piano-amp-strings-10711.mp3',
        status: 1,
        data: Array(400).fill(0).map((_, i) => (Math.random() > 0.9 ? 1 : 0)) // Random basic map
      },
      {
        name: 'Desert Dunes',
        description: 'Sandy terrain with treacherous cactus obstacles.',
        image_url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        music_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=desert-camel-114631.mp3',
        status: 1,
        data: Array(400).fill(0).map((_, i) => (Math.random() > 0.85 ? 1 : 0))
      },
      {
        name: 'Ice Tundra',
        description: 'Slippery ice patches and frozen obstacles.',
        image_url: 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        music_url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_b5155f9df2.mp3?filename=ice-and-snow-nature-sounds-8064.mp3',
        status: 1,
        data: Array(400).fill(0).map((_, i) => (Math.random() > 0.95 ? 1 : 0))
      }
    ];

    for (const map of maps) {
      // Check if map already exists to avoid duplicates if run multiple times
      const res = await pool.query('SELECT map_id FROM maps WHERE name = $1', [map.name]);
      if (res.rows.length === 0) {
        await pool.query(
          `INSERT INTO maps (name, description, image_url, music_url, status, data) VALUES ($1, $2, $3, $4, $5, $6)`,
          [map.name, map.description, map.image_url, map.music_url, map.status, JSON.stringify(map.data)]
        );
        console.log(`- Map '${map.name}' created`);
      } else {
        console.log(`- Map '${map.name}' already exists`);
      }
    }

    console.log('Mock data insertion completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error inserting mock data:', err);
    process.exit(1);
  }
}

mockData();
