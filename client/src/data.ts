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
