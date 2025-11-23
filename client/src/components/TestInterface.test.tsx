
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TestInterface from './TestInterface';
import { supabase } from '../utils/supabaseClient';
import { fetchTestData } from '../utils/testData';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('../utils/testData', () => ({
  fetchTestData: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock Data
const mockTest = {
  testId: 'test-123',
  title: 'Sample Test',
  description: 'A sample test',
  duration: 60,
  url: 'http://example.com/test.json',
  subject: 'Math',
  questionCount: 5,
  exam: 'JEE' as const,
};

const mockTestData = {
  testId: 'test-123',
  title: 'Sample Test',
  duration: 3600,
  totalMarks: 100,
  sections: [{ name: 'Section 1' }],
  questions: [
    {
      id: 'q1',
      uuid: 'uuid-1',
      text: 'Question 1',
      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
      ],
      section: 'Section 1',
    },
    {
        id: 'q2',
        uuid: 'uuid-2',
        text: 'Question 2',
        options: [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
        ],
        section: 'Section 1',
      },
  ],
};

const mockUser = { id: 'user-123', email: 'test@example.com' };

describe('TestInterface', () => {
  const mockNavigate = jest.fn();
  const mockOnSubmitSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (fetchTestData as jest.Mock).mockResolvedValue(mockTestData);
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  it('renders test and handles option selection and unselection (toggle)', async () => {
    // Mock Supabase from('student_tests') chains
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockSingle = jest.fn();

    // Create a chainable mock object
    const mockChain = {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        eq: jest.fn().mockReturnThis(),
        single: mockSingle,
        then: jest.fn((cb) => Promise.resolve(cb({ error: null }))) // Mock then for promises
    };

    // Ensure eq returns the chain too
    mockChain.eq.mockReturnValue(mockChain);
    // Ensure select returns the chain
    mockSelect.mockReturnValue(mockChain);
    // Ensure update returns the chain (it usually returns a promise, but in our code we await it or use .then)
    // In our code: supabase.from().update().eq().then(...)
    mockUpdate.mockReturnValue(mockChain);

    (supabase.from as jest.Mock).mockReturnValue(mockChain);

    // First call to select('id, started_at, answers')
    // Return existing record with NO answers initially
    mockSingle.mockResolvedValue({
        data: { id: 'row-123', started_at: new Date().toISOString(), answers: null },
        error: null
    });

    await act(async () => {
        render(<TestInterface test={mockTest} onSubmitSuccess={mockOnSubmitSuccess} exam="JEE" />);
    });

    // Wait for test data to load
    await waitFor(() => expect(screen.getByText('Question 1 of 2')).toBeInTheDocument());

    const optionA = screen.getByText('Option A').closest('button');
    expect(optionA).toBeInTheDocument();

    // 1. Select Option A
    fireEvent.click(optionA!);

    await waitFor(() => {
         // Verify autosave called
         // supabase.from('student_tests').update({ answers: ... }).eq('id', 'row-123')
         expect(supabase.from).toHaveBeenCalledWith('student_tests');
         expect(mockUpdate).toHaveBeenCalledWith({ answers: { 'uuid-1': 'A' } });
         expect(mockChain.eq).toHaveBeenCalledWith('id', 'row-123');
    });

    // 2. Click Option A AGAIN (Unmark)
    fireEvent.click(optionA!);

    // Verify autosave called with REMOVED answer
    await waitFor(() => {
         expect(mockUpdate).toHaveBeenLastCalledWith({ answers: {} });
    });

    // 3. Select Option B
    const optionB = screen.getByText('Option B').closest('button');
    fireEvent.click(optionB!);

    await waitFor(() => {
        expect(mockUpdate).toHaveBeenLastCalledWith({ answers: { 'uuid-1': 'B' } });
   });

  });

  it('loads existing answers from DB on initialization', async () => {
    const mockSelect = jest.fn();
    const mockUpdate = jest.fn();
    const mockSingle = jest.fn();

    const mockChain = {
        select: mockSelect,
        update: mockUpdate,
        eq: jest.fn().mockReturnThis(),
        single: mockSingle,
        then: jest.fn((cb) => Promise.resolve(cb({ error: null })))
    };
    mockSelect.mockReturnValue(mockChain);
    mockUpdate.mockReturnValue(mockChain);
    mockChain.eq.mockReturnValue(mockChain);

    (supabase.from as jest.Mock).mockReturnValue(mockChain);

    // Simulate existing answers in DB
    const existingAnswers = { 'uuid-1': 'B' };
    mockSingle.mockResolvedValue({
        data: { id: 'row-123', started_at: new Date().toISOString(), answers: existingAnswers },
        error: null
    });

    await act(async () => {
        render(<TestInterface test={mockTest} onSubmitSuccess={mockOnSubmitSuccess} exam="JEE" />);
    });

    await waitFor(() => expect(screen.getByText('Question 1 of 2')).toBeInTheDocument());

    const optionB = screen.getByText('Option B').closest('button');

    // We expect it to be selected. The component logic sets selectedOption state.
    // Click Option B (should toggle OFF)
    fireEvent.click(optionB!);

    await waitFor(() => {
        // Should update to empty
        expect(mockUpdate).toHaveBeenCalledWith({ answers: {} });
    });
  });
});
