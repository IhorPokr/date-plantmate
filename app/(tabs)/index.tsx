import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase, getCompleteSession } from '../../constants/supabaseClient';
import Slider from '@react-native-community/slider';

type Mood = 'Romantic' | 'Adventurous' | 'Relaxing' | 'Fun';
type Location = 'Indoor' | 'Outdoor' | 'No Preference';
type FoodPreference = 'Yes' | 'No' | 'Surprise Me';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Quiz state
  const [mood, setMood] = useState<Mood | null>(null);
  const [budget, setBudget] = useState(100);
  const [location, setLocation] = useState<Location | null>(null);
  const [foodPreference, setFoodPreference] = useState<FoodPreference | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        router.replace('/(auth)/login');
        return;
      }
      
      if (!session) {
        router.replace('/(auth)/login');
        return;
      }
      
      const completeSession = await getCompleteSession();
      console.log('Complete session:', completeSession);
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking session:', error);
      router.replace('/(auth)/login');
    }
  }

  const handleGetDateIdea = () => {
    setShowQuiz(true);
  };

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 0:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>What's your mood today?</Text>
            <View style={styles.optionsContainer}>
              {(['Romantic', 'Adventurous', 'Relaxing', 'Fun'] as Mood[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    mood === option && styles.selectedOption
                  ]}
                  onPress={() => {
                    setMood(option);
                    setCurrentQuestion(1);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    mood === option && styles.selectedOptionText
                  ]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>What's your budget?</Text>
            <Text style={styles.budgetText}>${budget}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={500}
              step={10}
              value={budget}
              onValueChange={setBudget}
              minimumTrackTintColor="#0284c7"
              maximumTrackTintColor="#d1d5db"
            />
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setCurrentQuestion(2)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>Do you prefer an indoor or outdoor activity?</Text>
            <View style={styles.optionsContainer}>
              {(['Indoor', 'Outdoor', 'No Preference'] as Location[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    location === option && styles.selectedOption
                  ]}
                  onPress={() => {
                    setLocation(option);
                    setCurrentQuestion(3);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    location === option && styles.selectedOptionText
                  ]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>Would you like a food-related activity?</Text>
            <View style={styles.optionsContainer}>
              {(['Yes', 'No', 'Surprise Me'] as FoodPreference[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    foodPreference === option && styles.selectedOption
                  ]}
                  onPress={() => {
                    setFoodPreference(option);
                    // Handle quiz completion
                    console.log({
                      mood,
                      budget,
                      location,
                      foodPreference: option
                    });
                    setShowQuiz(false);
                    setCurrentQuestion(0);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    foodPreference === option && styles.selectedOptionText
                  ]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (showQuiz) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {renderQuestion()}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleGetDateIdea}
      >
        <Text style={styles.buttonText}>Get a Date Idea</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    color: '#1f2937',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#0284c7',
  },
  optionText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  budgetText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0284c7',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
