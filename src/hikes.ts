export type Hike = {
  id: string;
  name: string;
  difficulty: number;
  notes: string;
  location?: string;
  photo?: string;
  durationMinutes?: number;
  lengthMiles?: number;
  sentiment?: 'Loved it' | 'It was okay' | 'Not for me';
};

export type FriendReview = Hike & { author: string; initials: string; when: string; score: number };

export const difficultyLabels = ['Easy', 'Fairly easy', 'Moderate', 'Hard', 'Very hard'];

// Fictional reviews for exploring the frontend. Photos are illustrative scenery,
// not verified photographs of the named trails. No live friend or trail data.
export const friendReviews: FriendReview[] = [
  {
    id: 'sample-tammany', name: 'Mount Tammany', location: 'New Jersey',
    author: 'Maya Chen', initials: 'MC', when: 'Yesterday', sentiment: 'Loved it', score: 9.1, difficulty: 4,
    notes: 'Steep right from the start, but the view made the climb worth it. I’d go early next time and leave more time at the top.',
    photo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sample-breakneck', name: 'Breakneck Ridge', location: 'New York',
    author: 'Alex Rivera', initials: 'AR', when: '2 days ago', sentiment: 'Loved it', score: 8.3, difficulty: 5,
    notes: 'The scramble was my favorite part. More hands-on climbing than I expected; my legs definitely felt it the next day.',
    photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sample-lake', name: 'Lake Minnewaska', location: 'New York',
    author: 'Sam Patel', initials: 'SP', when: '3 days ago', sentiment: 'Loved it', score: 8.7, difficulty: 2,
    notes: 'A slower day by the water. This is the one I’d pick when I want a long catch-up with a friend instead of a tough climb.',
    photo: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
  },
];
