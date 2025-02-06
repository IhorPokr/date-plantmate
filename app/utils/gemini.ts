const GEMINI_API_KEY = 'AIzaSyCpb7k5CgqJ4_Yeaz_afesbOsaoR_zSRHQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function generateDateIdea(
  mood: string,
  budget: number,
  location: string,
  foodPreference: string
) {
  try {
    const prompt = `Generate a creative date idea with these preferences:
      - Mood: ${mood}
      - Budget: $${budget}
      - Location: ${location}
      - Food Preference: ${foodPreference}
      
      Please provide a structured response with:
      - Title of the date idea
      - Brief description
      - Estimated cost
      - Duration
      - What makes it special`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
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