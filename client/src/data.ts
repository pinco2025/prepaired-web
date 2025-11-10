export interface StudyPlanItem {
  subject: string;
  topic: string;
  task: string;
  icon: string;
  buttonText: string;
  buttonColor: string;
}

export interface ActivityItem {
  title: string;
  date: string;
  metric: string;
  value: string;
  metricColor: string;
}

export interface RecommendationItem {
  title: string;
  description: string;
  actionText: string;
}

export const studyPlan: StudyPlanItem[] = [
  {
    subject: 'Physics',
    topic: 'Electrostatics',
    task: 'Complete 20 practice questions.',
    icon: 'science',
    buttonText: 'Start',
    buttonColor: 'primary',
  },
  {
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    task: 'Review chapter notes.',
    icon: 'biotech',
    buttonText: 'Review',
    buttonColor: 'green-500',
  },
  {
    subject: 'Maths',
    topic: 'Limits & Continuity',
    task: 'Take a short quiz (15 mins).',
    icon: 'calculate',
    buttonText: 'Quiz',
    buttonColor: 'orange-500',
  },
];

export const recentActivity: ActivityItem[] = [
  {
    title: 'Mock Test - Physics #3',
    date: 'Completed on Oct 26',
    metric: 'Score',
    value: '85%',
    metricColor: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Practice: Organic Chemistry',
    date: 'Completed on Oct 25',
    metric: 'Accuracy',
    value: '72%',
    metricColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    title: 'Full Syllabus Test #1',
    date: 'Completed on Oct 24',
    metric: 'Score',
    value: '64%',
    metricColor: 'text-red-500 dark:text-red-400',
  },
];

export const recommendations: RecommendationItem[] = [
  {
    title: 'Weak Topic: Rotational Motion',
    description: 'Focus on this area to improve your Physics score.',
    actionText: 'Start Practice',
  },
  {
    title: 'Video Lecture: p-Block Elements',
    description: 'A quick revision video to solidify your concepts.',
    actionText: 'Watch Now',
  },
  {
    title: 'Timed Quiz: Calculus',
    description: 'Challenge yourself with a 20-minute quiz.',
    actionText: 'Take Quiz',
  },
];

export interface Section {
  title: string;
  chapters: string[];
}

export interface SubjectDetailsData {
  title: string;
  sections: Section[];
}

export const subjectDetails: { [subject: string]: { [grade: string]: SubjectDetailsData } } = {
  'chemistry': {
    '11': {
      title: 'Class 11 Chemistry',
      sections: [
        {
          title: 'Physical Chemistry',
          chapters: [
            '1. Some Basic Concepts of Chemistry',
            '2. Structure of Atom',
            '3. States of Matter',
            '4. Thermodynamics',
            '5. Equilibrium',
          ],
        },
        {
          title: 'Inorganic Chemistry',
          chapters: [
            '6. Classification of Elements and Periodicity in Properties',
            '7. Chemical Bonding and Molecular Structure',
            '8. Redox Reactions',
            '9. Hydrogen',
            '10. The s-Block Elements',
            '11. The p-Block Elements',
          ],
        },
        {
          title: 'Organic Chemistry',
          chapters: [
            '12. Organic Chemistry – Some Basic Principles and Techniques',
            '13. Hydrocarbons',
            '14. Environmental Chemistry',
          ],
        },
      ],
    }
  }
};
