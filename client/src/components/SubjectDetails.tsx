import React from 'react';
import { useParams } from 'react-router-dom';
import { subjectDetails } from '../data';

const SubjectDetails: React.FC = () => {
  const { subject, grade } = useParams<{ subject: string; grade: string }>();

  // Ensure subject and grade are not undefined before using them
  if (!subject || !grade) {
    // Handle the case where the parameters are not provided
    return <div>Invalid subject or grade</div>;
  }

  const subjectData = subjectDetails[subject.toLowerCase()]?.[grade];

  if (!subjectData) {
    return <div>Details not found for {subject} Grade {grade}</div>;
  }

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark text-center sm:text-left">{subjectData.title}</h1>
        </div>
        <div className="space-y-8">
          {subjectData.sections.map((section, index) => (
            <details key={index} className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-card-light dark:shadow-card-dark" open={index === 0}>
              <summary className="flex justify-between items-center cursor-pointer list-none p-4 rounded-lg border-t-2 border-primary">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">{section.title}</h2>
                </div>
                <span className="material-icons-outlined chevron text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-border-light dark:border-border-dark pt-6 space-y-4">
                  {section.chapters.map((chapter, chapterIndex) => (
                    <a key={chapterIndex} href="#" className="block text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors">
                      {chapter}
                    </a>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SubjectDetails;
