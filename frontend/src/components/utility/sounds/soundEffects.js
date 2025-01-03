import {Howl} from 'howler';
import collectSound from '../../../assets/collect.wav';
import solveSound from '../../../assets/solve.wav';
import wrongAnswerSound from '../../../assets/wrongAnswer.wav';

let sounds = {};

export const initializeSounds = () => {
  if (Object.keys(sounds).length === 0) { // Initialisiere Sounds nur einmal
    console.log('Start initializing sounds');
    sounds = {
      collectPoint: new Howl({ src: [collectSound], volume: 0.1 }),
      correctAnswer: new Howl({ src: [solveSound], volume: 0.1 }),
      wrongAnswer: new Howl({ src: [wrongAnswerSound], volume: 0.1 }),
    };
    console.log('Sounds initialized');
  }
};

export const getSounds = () => sounds; // Zugriff auf die Sounds
