import {Howl} from 'howler';
// import {createAudioContext} from "./audioContext.js";

let sounds = {};

export const initializeSounds = () => {
  if (Object.keys(sounds).length === 0) { // Initialisiere Sounds nur einmal
    console.log('Start initializing sounds');
    sounds = {
      collectPoint: new Howl({ src: ['./src/assets/eat.wav'], volume: 0.1 }),
      correctAnswer: new Howl({ src: ['./src/assets/solve.wav'], volume: 0.1 }),
      wrongAnswer: new Howl({ src: ['./src/assets/wrongAnswer.wav'], volume: 0.1 }),
      boost: new Howl({ src: ['/sounds/boost.mp3'], volume: 0.1 }),
      collision: new Howl({ src: ['/sounds/collision.mp3'], volume: 0.1 }),
    };
    console.log('Sounds initialized');
  }
};

export const setupAudio = () => {
  if (!Howler.ctx) {
    console.error('Howler AudioContext nicht verfügbar');
    return Promise.reject(new Error('AudioContext nicht verfügbar'));
  }

  return Howler.ctx.resume().then(() => {
    console.log('AudioContext aktiviert');
  }).catch((error) => {
    console.error('Fehler beim Aktivieren des AudioContext:', error);
  });
};


export const getSounds = () => sounds; // Zugriff auf die Sounds
