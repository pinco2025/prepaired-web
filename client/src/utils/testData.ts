export interface Option {
  id: string;
  text: string;
  image?: string | number | null;
}

export interface Question {
  id: string;
  uuid: string;
  text: string;
  image?: string | number | null;
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
  // Add timeout to prevent indefinite hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch test data from ${url}`);
    }
    const testData = await response.json();
    return testData;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection.');
    }
    throw error;
  }
};
