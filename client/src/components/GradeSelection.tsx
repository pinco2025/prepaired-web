import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GradeSelectionProps {
  subject: string;
  onBack: () => void;
}

const GradeSelection: React.FC<GradeSelectionProps> = ({ subject, onBack }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onBack();
      setIsFadingOut(false);
    }, 300);
  };

  const handleGradeSelect = (grade: string) => {
    navigate(`/subjects/${subject}/${grade}`);
  };

  return (
    <div className={`transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">{subject}</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Select your grade to begin.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-16 lg:gap-24">
            <button className="group" onClick={() => handleGradeSelect('11')}>
              <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center bg-surface-light dark:bg-surface-dark rounded-full shadow-card-light dark:shadow-card-dark grade-circle border-2 border-transparent group-hover:border-primary dark:group-hover:border-primary">
                <span className="text-8xl font-bold text-primary">11</span>
              </div>
            </button>
            <button className="group" onClick={() => handleGradeSelect('12')}>
              <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center bg-surface-light dark:bg-surface-dark rounded-full shadow-card-light dark:shadow-card-dark grade-circle border-2 border-transparent group-hover:border-primary dark:group-hover:border-primary">
                <span className="text-8xl font-bold text-primary">12</span>
              </div>
            </button>
          </div>
          <div className="text-center mt-12">
            <button
              onClick={handleBack}
              className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              &larr; Back to subjects
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradeSelection;
