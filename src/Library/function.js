import fs from 'fs/promises';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';
import { tmpdir } from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';

const execute = promisify(exec);
const writeFile = fs.writeFile;
const readFile = fs.readFile;
const unlink = fs.unlink;

class bard {
  constructor() {}

  async question({ ask }) {
    if (!ask) {
      throw new Error("Please specify a question!");
    }
    try {
      const response = await axios.post(`https://bard.rizzy.eu.org/api/onstage`, { ask }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      throw new Error("Error: " + err.message);
    }
  }

 
  async questionWithImage({ ask, image }) {
    if (!ask) {
      throw new Error("Please specify a question!");
    }
    if (!image) {
      throw new Error("Please specify a URL for the image!");
    }
    try {
      const response = await axios.post(`https://bard.rizzy.eu.org/api/onstage/image`, { ask, image }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      throw new Error("Error: " + err.message);
    }
  }
}

const collage = async (images) => {
  const canvas = createCanvas(1050, 1800);
  const ctx = canvas.getContext('2d');
  const processedImages = await getImages(images);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 1050, 1800);
  const positions = [[0, 0], [360, 0], [720, 0], [0, 470], [360, 470], [720, 470], [0, 940], [360, 940], [720, 940], [0, 1410], [360, 1410], [720, 1410]];
  for (let i = 0; i < processedImages.length; i++) {
      const [x, y] = positions[i];
      ctx.drawImage(processedImages[i], x, y, 350, 450);
  }
  return canvas.toBuffer();
};

const getBuffer = async (url) => {
    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer);
    } catch (error) {
        console.error("Failed to get buffer", error);
        throw new Error("Failed to get buffer");
    }
};

const getImages = async (images) => {
    const processedImages = await Promise.all(
        images.map(async (image) => {
            let processedImage = image;
            if (image.endsWith('.gif')) {
                const name = tmpdir().concat('/', Math.random().toString(36).substr(2, 5));
                const filename = (ext) => name.concat('.', ext);
                await writeFile(filename('gif'), await getBuffer(image));
                await execute(`ffmpeg -i "${filename('gif')}" -vf "select=eq(n\\,0)" -q:v 3 "${filename('jpg')}"`);
                processedImage = await readFile(filename('jpg'));
                await Promise.all([unlink(filename('gif')), unlink(filename('jpg'))]);
            }
            return await loadImage(processedImage);
        })
    );
    return processedImages;
};

const gifToMp4 = async (gif, write = false) => {
    try {
        const filename = `${tmpdir()}/${Math.random().toString(36)}`;
        await writeFile(`${filename}.gif`, gif);
        await execute(`ffmpeg -f gif -i ${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${filename}.mp4`);
        if (write) return `${filename}.mp4`;
        const buffer = await readFile(`${filename}.mp4`);
        await Promise.all([unlink(`${filename}.gif`), unlink(`${filename}.mp4`)]);
        return buffer;
    } catch (error) {
        console.error('Error converting GIF to MP4:', error);
        throw new Error('Error converting GIF to MP4.');
    }
};

const random = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export { bard, collage, getBuffer, getImages, gifToMp4, random };