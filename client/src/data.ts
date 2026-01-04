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
    },
  },

  'physics': {
    '11': {
      title: 'Class 11 Physics',
      sections: [
        {
          title: 'Mechanics',
          chapters: [
            '1. Physical World',
            '2. Units and Measurements',
            '3. Motion in a Straight Line',
            '4. Motion in a Plane',
            '5. Laws of Motion',
            '6. Work, Energy and Power',
            '7. System of Particles and Rotational Motion',
            '8. Gravitation',
          ],
        },
        {
          title: 'Thermodynamics & Waves',
          chapters: [
            '9. Mechanical Properties of Solids',
            '10. Mechanical Properties of Fluids',
            '11. Thermal Properties of Matter',
            '12. Thermodynamics',
            '13. Kinetic Theory',
            '14. Oscillations',
            '15. Waves',
          ],
        },
      ],
    },
  },

  'mathematics': {
    '11': {
      title: 'Class 11 Mathematics',
      sections: [
        {
          title: 'Algebra',
          chapters: [
            '1. Sets',
            '2. Relations and Functions',
            '3. Trigonometric Functions',
            '4. Principle of Mathematical Induction',
            '5. Complex Numbers and Quadratic Equations',
            '6. Linear Inequalities',
            '7. Permutations and Combinations',
          ],
        },
        {
          title: 'Calculus & Geometry',
          chapters: [
            '8. Binomial Theorem',
            '9. Sequences and Series',
            '10. Straight Lines',
            '11. Conic Sections',
            '12. Introduction to Three-dimensional Geometry',
            '13. Limits and Derivatives',
          ],
        },
        {
          title: 'Statistics & Probability',
          chapters: [
            '14. Mathematical Reasoning',
            '15. Statistics',
            '16. Probability',
          ],
        },
      ],
    },
  },

  'biology': {
    '11': {
      title: 'Class 11 Biology',
      sections: [
        {
          title: 'Diversity of Living Organisms',
          chapters: [
            '1. The Living World',
            '2. Biological Classification',
            '3. Plant Kingdom',
            '4. Animal Kingdom',
          ],
        },
        {
          title: 'Structural Organisation',
          chapters: [
            '5. Morphology of Flowering Plants',
            '6. Anatomy of Flowering Plants',
            '7. Structural Organisation in Animals',
          ],
        },
        {
          title: 'Cell & Physiology',
          chapters: [
            '8. Cell: The Unit of Life',
            '9. Biomolecules',
            '10. Cell Cycle and Cell Division',
            '11. Transport in Plants',
            '12. Mineral Nutrition',
            '13. Photosynthesis in Higher Plants',
            '14. Respiration in Plants',
            '15. Plant Growth and Development',
            '16. Digestion and Absorption',
            '17. Breathing and Exchange of Gases',
            '18. Body Fluids and Circulation',
            '19. Excretory Products and Their Elimination',
            '20. Locomotion and Movement',
            '21. Neural Control and Coordination',
            '22. Chemical Coordination and Integration',
          ],
        },
      ],
    },
  },
};

export interface Question {
  id: string;
  uuid: string;
  text: string;
  image?: string;
  options: { id: string; text: string; image?: string }[];
  correctOption: string;
  section: string;
}

export interface Test {
  id: string;
  testID?: number;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  markingScheme: string;
  instructions: string[];
  url: string;
  exam?: 'Normal' | 'JEE' | 'NEET';
  questions?: Question[];
  maximum_marks?: number;
  sections?: { name: string }[];
}

export interface TestCategory {
  title: string;
  icon: string;
  tests: Test[];
}

export interface UserAnalytics {
  user_id: string;
  phy_avg: number;
  chem_avg: number;
  math_avg: number;
  accuracy: number;
  attempt_no: number;
  percentile?: number;
  history_url?: string;
}
