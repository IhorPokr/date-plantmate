import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { supabase, getCompleteSession } from '../../constants/supabaseClient';
import Slider from '@react-native-community/slider';
import { generateDateIdea } from '../utils/gemini';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';

type Mood = 'Romantic' | 'Adventurous' | 'Relaxing' | 'Fun';
type Location = 'Indoor' | 'Outdoor' | 'No Preference';
type FoodPreference = 'Yes' | 'No' | 'Surprise Me';

export default function Index() {
  const { isDarkMode } = useTheme();
  const theme = colors[isDarkMode ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Quiz state
  const [mood, setMood] = useState<Mood | null>(null);
  const [budget, setBudget] = useState(100);
  const [location, setLocation] = useState<Location | null>(null);
  const [foodPreference, setFoodPreference] = useState<FoodPreference | null>(null);

  // Add new state for AI response
  const [dateIdea, setDateIdea] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  const handleShare = async (idea: string) => {
    try {
      await Share.share({
        message: idea,
        title: 'Check out this date idea!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleQuizComplete = async (selectedFoodPreference: FoodPreference) => {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        setGenerating(true);
        setFoodPreference(selectedFoodPreference);
        setShowQuiz(false);
        
        const idea = await generateDateIdea(
          mood!,
          budget,
          location!,
          selectedFoodPreference
        );

        const { data: { session } } = await supabase.auth.getSession();
        const { data, error } = await supabase
          .from('ai_generated_ideas')
          .insert([
            {
              user_id: session?.user.id,
              idea: idea,
              preferences: {
                mood,
                budget,
                location,
                foodPreference: selectedFoodPreference
              }
            }
          ])
          .select()
          .single();

        if (error) throw error;
        setDateIdea(idea);
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          Alert.alert(
            'Connection Error',
            'Please check your internet connection and try again'
          );
          setShowQuiz(true);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      } finally {
        setGenerating(false);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (showQuiz) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={[styles.scrollContentContainer, { justifyContent: 'center', flex: 1 }]}
        >
          <View style={[styles.quizCard, { backgroundColor: theme.background }]}>
            <Text style={[styles.questionText, { color: theme.text }]}>
              {currentQuestion === 0 && "What's your mood today?"}
              {currentQuestion === 1 && "What's your budget?"}
              {currentQuestion === 2 && "Indoor or outdoor activity?"}
              {currentQuestion === 3 && "Include food in your date?"}
            </Text>

            {currentQuestion === 1 ? (
              <View style={[styles.budgetContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.budgetAmount, { color: theme.text }]}>${budget}</Text>
                <Slider
                  style={[styles.slider, { backgroundColor: theme.background }]}
                  minimumValue={0}
                  maximumValue={500}
                  step={10}
                  value={budget}
                  onValueChange={setBudget}
                  minimumTrackTintColor={theme.primary}
                  maximumTrackTintColor="#3C3C3E"
                />
                <TouchableOpacity
                  style={[styles.primaryButton, styles.budgetNextButton]}
                  onPress={() => setCurrentQuestion(2)}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.optionsContainer, { backgroundColor: theme.background }]}>
                {(currentQuestion === 0 ? ['Romantic', 'Adventurous', 'Relaxing', 'Fun'] :
                  currentQuestion === 2 ? ['Indoor', 'Outdoor', 'No Preference'] :
                  ['Yes', 'No', 'Surprise Me']).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      (mood === option || location === option || foodPreference === option) && 
                      styles.selectedOption
                    ]}
                    onPress={() => {
                      if (currentQuestion === 0) {
                        setMood(option as Mood);
                        setCurrentQuestion(1);
                      } else if (currentQuestion === 2) {
                        setLocation(option as Location);
                        setCurrentQuestion(3);
                      } else {
                        handleQuizComplete(option as FoodPreference);
                      }
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      (mood === option || location === option || foodPreference === option) && 
                      styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (generating) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Creating your perfect date...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (dateIdea) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <Text style={[styles.dateTitle, { color: theme.text }]}>
            {getDateTitle(dateIdea)}
          </Text>
          
          <View style={[styles.contentCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.description, { color: theme.text }]}>
              {getDateDescription(dateIdea)}
            </Text>

            <View style={[styles.detailsContainer, { backgroundColor: theme.card }]}>
              <View style={[styles.detailItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>ESTIMATED COST</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{getDateCost(dateIdea)}</Text>
              </View>
              <View style={[styles.detailDivider, { backgroundColor: theme.card }]} />
              <View style={[styles.detailItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>DURATION</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{getDateDuration(dateIdea)}</Text>
              </View>
            </View>

            <View style={[styles.actionButtons, { backgroundColor: theme.card }]}>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    
                    const { error } = await supabase
                      .from('ai_generated_ideas')
                      .insert({
                        user_id: session?.user.id,
                        idea: dateIdea,
                        saved: true,
                        preferences: {
                          mood,
                          budget,
                          location,
                          foodPreference
                        }
                      });

                    if (error) {
                      console.error('Save error:', error);
                      Alert.alert('Error', 'Failed to save');
                      return;
                    }
                    Alert.alert('Success', 'Date idea saved!');
                  } catch (error) {
                    console.error('Save error:', error);
                    Alert.alert('Error', 'Failed to save');
                  }
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>Save This Date</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, { backgroundColor: theme.card }]}
                onPress={() => {
                  setDateIdea(null);
                  setMood(null);
                  setLocation(null);
                  setFoodPreference(null);
                  setBudget(100);
                  setCurrentQuestion(0);
                  setShowQuiz(false);
                  setGenerating(false);
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {!showQuiz && !dateIdea && !generating && (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: theme.primary }]}
            onPress={handleGetDateIdea}
          >
            <Text style={[styles.mainButtonText, { color: theme.text }]}>
              Create Perfect Date
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function getDateTitle(idea: string): string {
  const titleMatch = idea.match(/Title:(.*?)(?=\n|$)/);
  return titleMatch ? titleMatch[1].trim() : 'Perfect Date Idea';
}

function getDateDescription(idea: string): string {
  const descMatch = idea.match(/Description:(.*?)(?=\n|$)/);
  return descMatch ? descMatch[1].trim() : '';
}

function getDateCost(idea: string): string {
  const costMatch = idea.match(/Estimated cost:(.*?)(?=\n|$)/);
  return costMatch ? costMatch[1].trim() : '';
}

function getDateDuration(idea: string): string {
  const durationMatch = idea.match(/Duration:(.*?)(?=\n|$)/);
  return durationMatch ? durationMatch[1].trim() : '';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mainButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateTitle: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  contentCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
    color: '#FFF',
    padding: 20,
    textAlign: 'left',
  },
  detailsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#2C2C2E',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#3C3C3E',
    marginHorizontal: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 17,
    color: '#FFF',
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#0A84FF',
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  quizCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.35,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  selectedOption: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  optionText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#FFF',
  },
  budgetContainer: {
    alignItems: 'center',
    gap: 24,
  },
  budgetAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#0A84FF',
    letterSpacing: 0.5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 17,
    color: '#FFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  budgetNextButton: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#0A84FF',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
