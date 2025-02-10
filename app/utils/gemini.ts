import { Alert } from 'react-native';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent';

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
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `Generate a family-friendly date idea with these parameters:
      Mood: ${mood}
      Budget: $${budget}
      Location: ${location}
      Include Food: ${foodPreference}

      Please create a wholesome, safe, and simple date activity.
      The date should be appropriate for all ages and follow these guidelines:
      - Keep it casual and fun
      - Focus on public places and common activities
      - Avoid anything controversial or inappropriate
      - Suggest widely available activities

      Format your response exactly like this:

      Title: [Family-friendly activity name]
      Description: [Brief, wholesome description]
      Estimated cost: [Cost range within budget]
      Duration: [Time estimate]
      What makes it special: [Simple positive aspect]`;

    console.log('Making Gemini request...');
    
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
          temperature: 0.7,
          topK: 32,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    });

    const responseData = await response.json();
    console.log('Gemini response:', responseData);

    if (!response.ok || !responseData.candidates || !responseData.candidates[0]) {
      throw new Error(`Gemini API error: ${responseData.error?.message || 'Failed to generate response'}`);
    }

    const content = responseData.candidates[0].content;
    if (!content || !content.parts || !content.parts[0]) {
      throw new Error('Invalid response format from Gemini');
    }

    return content.parts[0].text;
  } catch (error) {
    console.error('Detailed error:', error);
    Alert.alert(
      'Error',
      'Failed to generate date idea. Please try again.'
    );
    throw error;
  }
} 