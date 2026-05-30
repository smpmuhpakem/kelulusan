const axios = require('axios');
const cheerio = require('cheerio');

async function main() {
  try {
    const res = await axios.get('http://perpustakaansmpmuhammadiyahpakem.blogspot.com/');
    const $ = cheerio.load(res.data);
    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) images.push(src);
    });
    console.log('Found images:', images);
  } catch (err) {
    console.error('Error fetching blog:', err.message);
  }
}

main();
