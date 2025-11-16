import testData from '../sample-test-001.json';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  uuid: string;
  text: string;
  image: number;
  options: Option[];
  correctAnswer: string;
  marks: number;
  section: string;
  tags: {
    tag1: string;
    tag2: string;
    tag3: string;
    tag4: string;
    type: string;
    year: string;
  };
}

export interface Test {
  testId: string;
  title: string;
  duration: number;
  totalMarks: number;
  sections: {
    name: string;
    marksPerQuestion: number;
  }[];
  questions: Question[];
}

export const fetchTestData = (): Test => {
  return testData;
};
