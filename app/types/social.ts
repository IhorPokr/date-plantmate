export type DateMemory = {
  id: string;
  dateIdeaId: string;
  userId: string;
  photos: string[];
  rating: number;
  review: string;
  created_at: string;
};

export type DateChecklist = {
  id: string;
  dateIdeaId: string;
  userId: string;
  items: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  text: string;
  isCompleted: boolean;
}; 