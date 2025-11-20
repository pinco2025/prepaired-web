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

export const fetchTestData = async (url: string): Promise<Test> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch test data from ${url}`);
  }
  const testData = await response.json();
  return testData;
};
