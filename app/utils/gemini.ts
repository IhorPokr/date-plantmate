const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Add an array of different activity types
const activityTypes = [
  'outdoor adventure',
  'indoor cozy',
  'creative workshop',
  'food experience',
  'entertainment',
  'learning together',
  'sports and active',
  'relaxation',
  'cultural experience',
  'unique local spots'
];

export async function generateDateIdea(
  mood: string,
  budget: number,
  location: string,
  foodPreference: string
) {
  try {
    // Randomly select an activity type that fits the mood
    const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    const prompt = `Create a unique ${mood.toLowerCase()} date idea focusing on ${randomActivity}:
      Mood: ${mood}
      Budget: $${budget}
      Location: ${location}
      Food: ${foodPreference}

      Make it original and different from common date ideas.
      Write it in a fun, casual way, like telling a friend about a cool new idea.
      Use simple, everyday language and be specific about the activities.
      
      Format it exactly like this example, but make it totally different:

      Title: Paint & Sip in the Park
      Description: Pack some drinks and snacks, grab mini canvases and paints, and head to a nice spot in the park. Take turns picking what to paint and laugh at each other's artsy attempts!
      Estimated cost: $40-50 for art supplies and snacks
      Duration: 2-3 hours of creative fun
      What makes it special: It's way more laid-back than those formal paint & sip classes, plus you get to be outdoors and make silly memories

      Be creative and avoid common suggestions like "dinner and a movie" or "coffee date".
      Focus on making each idea unique and memorable!`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.95, // Increased for more randomness
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate date idea');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating date idea:', error);
    throw error;
  }
} 