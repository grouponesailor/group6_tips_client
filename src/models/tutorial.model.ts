export interface Topic {
  id: string;
  title: string;
  isNew: boolean;
  tipCount: number;
  icon?: string;
}

export interface Tip {
  id: string;
  topicId: string;
  title: string;
  content: string;
  imageUrl?: string;
  isNew: boolean;
  order: number;
  isRead?: boolean;
}

export interface TutorialState {
  topics: Topic[];
  currentTopic?: Topic;
  currentTips: Tip[];
  currentTipIndex: number;
  searchQuery: string;
  loading: boolean;
  error?: string;
  readTips: Set<string>;
}