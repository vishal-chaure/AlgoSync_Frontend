export interface Question {
  id: string;
  userId: string;
  title: string;
  description: string;
  examples?: string[];
  constraints?: string[];
  topicTags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platformTag: 'LeetCode' | 'GFG' | 'Codeforces' | 'Other';
  platformLink: string;
  youtubeLink?: string;
  isImportant: boolean;
  isSolved: boolean;
  savedCode?: string;
  generatedCode?: string;
  language: string;
  topic: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TopicSection {
  name: string;
  questions: Question[];
  isExpanded: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  authProvider: string;
  createdAt: Date;
}
