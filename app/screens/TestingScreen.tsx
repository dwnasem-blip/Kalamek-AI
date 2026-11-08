import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../providers/ThemeProvider';
import { useI18n } from '../providers/I18nProvider';
import { formatDuration, formatBytes } from '../utils/formatting';

interface TestState {
  videoPath?: string;
  audioPath?: string;
  transcript?: string;
  words?: Array<{
    word: string;
    startTimeMs: number;
    endTimeMs: number;
    confidence: number;
  }>;
  isProcessing: boolean;
  currentStep: 'idle' | 'video-selected' | 'extracting-audio' | 'transcribing' | 'completed' | 'error';
  error?: string;
  processedText?: string;
  selectedFontSize: number;
}

/**
 * Testing Screen for Kalamek AI Core Features
 */
export default function TestingScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const styles = useStyles(theme);

  const [state, setState] = useState<TestState>({
    isProcessing: false,
    currentStep: 'idle',
    selectedFontSize: 32,
  });

  const scrollViewRef = useRef<ScrollView>(null);

  // Step 1: Select Video
  const handleSelectVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (result.type === 'success') {
        setState((prev) => ({
          ...prev,
          videoPath: result.uri,
          currentStep: 'video-selected',
          error: undefined,
        }));

        Alert.alert('✅ Video Selected', `File: ${result.name}`);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  // Step 2: Extract Audio
  const handleExtractAudio = async () => {
    if (!state.videoPath) {
      Alert.alert('❌ Error', 'Please select a video first');
      return;
    }

    setState((prev) => ({
      ...prev,
      isProcessing: true,
      currentStep: 'extracting-audio',
    }));

    try {
      // Simulate extraction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setState((prev) => ({
        ...prev,
        audioPath: 'extracted_audio.mp3',
        isProcessing: false,
      }));

      Alert.alert('✅ Audio Extracted', 'Ready for transcription');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Audio extraction failed',
      }));
    }
  };

  // Step 3: Transcribe Audio
  const handleTranscribe = async () => {
    if (!state.audioPath) {
      Alert.alert('❌ Error', 'Please extract audio first');
      return;
    }

    setState((prev) => ({
      ...prev,
      isProcessing: true,
      currentStep: 'transcribing',
    }));

    try {
      // Simulate Whisper transcription
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockTranscript = 'السلام عليكم ورحمة الله وبركاته';
      const mockWords = [
        { word: 'السلام', startTimeMs: 0, endTimeMs: 500, confidence: 0.95 },
        { word: 'عليكم', startTimeMs: 500, endTimeMs: 1000, confidence: 0.92 },
        { word: 'ورحمة', startTimeMs: 1000, endTimeMs: 1500, confidence: 0.98 },
        { word: 'الله', startTimeMs: 1500, endTimeMs: 2000, confidence: 0.96 },
        { word: 'وبركاته', startTimeMs: 2000, endTimeMs: 2500, confidence: 0.91 },
      ];

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        currentStep: 'completed',
        transcript: mockTranscript,
        words: mockWords,
      }));

      Alert.alert('✅ Transcription Complete', `${mockWords.length} words detected`);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Transcription failed',
      }));
    }
  };

  // Edit transcript
  const handleEditTranscript = (newText: string) => {
    setState((prev) => ({
      ...prev,
      processedText: newText,
    }));
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          🎬 Kalamek AI Testing
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Test core features with real data
        </Text>
      </View>

      {/* Step 1: Video Selection */}
      <StepCard
        step={1}
        title="Select Video"
        description="Choose a video file from your device"
        completed={state.currentStep !== 'idle'}
        onPress={handleSelectVideo}
        theme={theme}
      >
        {state.videoPath && (
          <Text style={[styles.selectedFile, { color: theme.colors.success }]}>
            ✅ Video selected
          </Text>
        )}
      </StepCard>

      {/* Step 2: Audio Extraction */}
      <StepCard
        step={2}
        title="Extract Audio"
        description="Extract audio from video for processing"
        completed={state.currentStep !== 'idle' && state.currentStep !== 'video-selected'}
        disabled={!state.videoPath}
        loading={state.isProcessing && state.currentStep === 'extracting-audio'}
        onPress={handleExtractAudio}
        theme={theme}
      >
        {state.audioPath && (
          <Text style={[styles.selectedFile, { color: theme.colors.success }]}>
            ✅ Audio extracted (extracted_audio.mp3)
          </Text>
        )}
      </StepCard>

      {/* Step 3: Transcription */}
      <StepCard
        step={3}
        title="Transcribe (Whisper AI)"
        description="Convert speech to Arabic text"
        completed={state.currentStep === 'completed'}
        disabled={!state.audioPath}
        loading={state.isProcessing && state.currentStep === 'transcribing'}
        onPress={handleTranscribe}
        theme={theme}
      >
        {state.transcript && (
          <View>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Transcript:
            </Text>
            <Text style={[styles.transcriptText, { color: theme.colors.text }]}>
              {state.transcript}
            </Text>
          </View>
        )}
      </StepCard>

      {/* Step 4: Word Timing Display */}
      {state.words && (
        <StepCard
          step={4}
          title="Word-Level Timing"
          description="View synchronized words and timing"
          completed={true}
          theme={theme}
        >
          <ScrollView
            horizontal={false}
            style={styles.wordsContainer}
            nestedScrollEnabled={true}
          >
            {state.words.map((wordData, index) => (
              <WordTimingCard
                key={index}
                word={wordData.word}
                startTime={wordData.startTimeMs}
                endTime={wordData.endTimeMs}
                confidence={wordData.confidence}
                theme={theme}
              />
            ))}
          </ScrollView>
        </StepCard>
      )}

      {/* Step 5: Text Editing */}
      {state.transcript && (
        <StepCard
          step={5}
          title="Edit Transcript"
          description="Modify the extracted text"
          completed={!!state.processedText}
          theme={theme}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
              },
            ]}
            placeholder="Edit transcript here"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            value={state.processedText || state.transcript}
            onChangeText={handleEditTranscript}
          />
        </StepCard>
      )}

      {/* Step 6: Font Preview */}
      {state.processedText || state.transcript && (
        <StepCard
          step={6}
          title="Font Selection & Preview"
          description="Test different Arabic fonts"
          completed={true}
          theme={theme}
        >
          <View style={styles.fontControlsContainer}>
            <View style={styles.fontSizeControl}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Font Size: {state.selectedFontSize}px
              </Text>
              <View style={styles.fontSizeButtons}>
                {[24, 32, 40, 48].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      {
                        backgroundColor:
                          state.selectedFontSize === size
                            ? theme.colors.primary
                            : theme.colors.surface,
                      },
                    ]}
                    onPress={() =>
                      setState((prev) => ({ ...prev, selectedFontSize: size }))
                    }
                  >
                    <Text
                      style={[
                        styles.sizeButtonText,
                        {
                          color:
                            state.selectedFontSize === size
                              ? 'white'
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fontPreviewContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Font Preview:
              </Text>

              {/* Preview with different fonts */}
              <Text
                style={[
                  styles.fontPreview,
                  {
                    fontSize: state.selectedFontSize,
                    color: theme.colors.text,
                  },
                  { fontFamily: 'Cairo' },
                ]}
              >
                {state.processedText || state.transcript}
              </Text>
            </View>
          </View>
        </StepCard>
      )}

      {/* Step 7: Export */}
      {state.transcript && (
        <StepCard
          step={7}
          title="Export Video"
          description="Generate final video with captions"
          completed={false}
          theme={theme}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.success }]}
            onPress={() => {
              Alert.alert(
                '📹 Export',
                'Video export will be done through the pipeline service'
              );
            }}
          >
            <Text style={styles.buttonText}>▶️  Export Now</Text>
          </TouchableOpacity>
        </StepCard>
      )}

      {/* Error Display */}
      {state.error && (
        <View style={[styles.errorContainer, { borderColor: theme.colors.error }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            ❌ {state.error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/**
 * Step Card Component
 */
interface StepCardProps {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  theme: any;
}

function StepCard({
  step,
  title,
  description,
  completed,
  disabled = false,
  loading = false,
  onPress,
  children,
  theme,
}: StepCardProps) {
  const styles = useStyles(theme);

  return (
    <View style={[styles.card, { borderColor: theme.colors.border }]}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.stepBadge,
            {
              backgroundColor: completed ? theme.colors.success : theme.colors.primary,
            },
          ]}
        >
          <Text style={styles.stepBadgeText}>{step}</Text>
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>

      {onPress && (
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: disabled ? theme.colors.border : theme.colors.primary,
            },
          ]}
          onPress={onPress}
          disabled={disabled || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {completed ? '✅ Completed' : '▶️  Start'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {children && <View style={styles.cardContent}>{children}</View>}
    </View>
  );
}

/**
 * Word Timing Card
 */
interface WordTimingCardProps {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
  theme: any;
}

function WordTimingCard({
  word,
  startTime,
  endTime,
  confidence,
  theme,
}: WordTimingCardProps) {
  const styles = useStyles(theme);

  return (
    <View
      style={[
        styles.wordCard,
        {
          borderLeftColor: theme.colors.primary,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <Text style={[styles.wordText, { color: theme.colors.text }]}>
        {word}
      </Text>
      <Text style={[styles.wordTiming, { color: theme.colors.textSecondary }]}>
        {formatDuration(startTime)} - {formatDuration(endTime)}
      </Text>
      <View
        style={[
          styles.confidenceBar,
          { backgroundColor: theme.colors.border, width: '100%' },
        ]}
      >
        <View
          style={[
            styles.confidenceFill,
            {
              backgroundColor: theme.colors.success,
              width: `${confidence * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.confidenceText, { color: theme.colors.textSecondary }]}>
        Confidence: {(confidence * 100).toFixed(0)}%
      </Text>
    </View>
  );
}

/**
 * Styles
 */
const useStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingVertical: 20,
    },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
    },
    card: {
      marginHorizontal: 16,
      marginVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    cardHeader: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    stepBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    stepBadgeText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    cardTitleContainer: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 13,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    },
    cardContent: {
      marginTop: 16,
    },
    selectedFile: {
      fontSize: 13,
      fontWeight: '500',
      marginTop: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    transcriptText: {
      fontSize: 16,
      lineHeight: 24,
      padding: 12,
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 8,
    },
    wordsContainer: {
      marginVertical: 8,
    },
    wordCard: {
      borderLeftWidth: 4,
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
    },
    wordText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    wordTiming: {
      fontSize: 12,
      marginBottom: 8,
    },
    confidenceBar: {
      height: 4,
      borderRadius: 2,
      marginBottom: 4,
      overflow: 'hidden',
    },
    confidenceFill: {
      height: '100%',
    },
    confidenceText: {
      fontSize: 11,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontFamily: 'Cairo',
      textAlignVertical: 'top',
    },
    fontControlsContainer: {
      marginVertical: 12,
    },
    fontSizeControl: {
      marginBottom: 16,
    },
    fontSizeButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    sizeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
    },
    sizeButtonText: {
      fontWeight: '600',
      fontSize: 12,
    },
    fontPreviewContainer: {
      marginTop: 16,
    },
    fontPreview: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
      textAlign: 'right',
      lineHeight: 32,
    },
    errorContainer: {
      marginHorizontal: 16,
      marginTop: 16,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: 'rgba(245,101,101,0.1)',
    },
    errorText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
