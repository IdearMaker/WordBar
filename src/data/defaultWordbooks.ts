import { WordBook } from '../types';
import oxford3000 from './wordbooks/oxford3000.json';
import cet4 from './wordbooks/cet4.json';
import cet6 from './wordbooks/cet6.json';
import postgrad from './wordbooks/postgrad.json';
import toefl from './wordbooks/toefl.json';
import programming from './wordbooks/programming.json';

export const defaultWordbooks: WordBook[] = [
  oxford3000 as WordBook,
  cet4 as WordBook,
  cet6 as WordBook,
  postgrad as WordBook,
  toefl as WordBook,
  programming as WordBook,
];
