// soundEffects.js
import { Howl } from 'howler';

const sounds = {
  collectPoint: new Howl({ src: ['./src/assets/collect.wav'], volume: 0.2}),
  correctAnswer: new Howl({ src: ['./src/assets/solve.wav'], volume: 0.2}),
  boost: new Howl({ src: ['/sounds/boost.mp3'], volume: 0.2}),
  collision: new Howl({ src: ['/sounds/collision.mp3'], volume: 0.2}),
};

export default sounds;
