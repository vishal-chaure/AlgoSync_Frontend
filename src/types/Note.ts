export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  tags?: string[];
  color?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  color?: string;
  isPinned?: boolean;
} 