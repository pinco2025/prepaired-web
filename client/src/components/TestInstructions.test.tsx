import React from 'react';
import { render, screen } from '@testing-library/react';
import TestInstructions from './TestInstructions';
import { Test } from '../data';

const mockTest: Test = {
  id: '1',
  title: 'JEE Main - Full Syllabus Mock Test 1',
  description: '',
  duration: 10800,
  totalQuestions: 90,
  markingScheme: '+4 for correct, -1 for incorrect',
  instructions: 'JEEM',
  url: '',
};

test('renders JEEM instructions', () => {
  render(<TestInstructions test={mockTest} onStartTest={() => {}} />);
  const headingElement = screen.getByText(/JEE Main - Full Syllabus Mock Test 1/i);
  expect(headingElement).toBeInTheDocument();
});