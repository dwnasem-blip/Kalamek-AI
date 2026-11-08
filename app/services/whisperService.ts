/**
 * OpenAI Whisper Service
 * Speech to Text with word-level timestamps
 */

import * as fs from 'fs';
import axios, { AxiosError } from 'axios';

export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  words: WordTiming[];
}

export interface WordTiming {
  word: string;
  startTimeMs: number;
  endTimeMs: number;
  confidence: number;
}

export interface WhisperOptions {
  language?: string; // ISO-639-1 code: 'ar', 'en', etc.
  temperature?: number; // 0-1
  timeout?: number;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

if (!OPENAI_API_KEY) {
  console.warn(
    '⚠️  OPENAI_API_KEY not set. Whisper transcription will fail. Set it in .env.local'
  );
}

/**
 * Transcribe audio file using OpenAI Whisper
 */
export const transcribeAudio = async (
  audioPath: string,
  options: WhisperOptions = {}
): Promise<TranscriptionResult> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    const fileSize = fs.statSync(audioPath).size;
    console.log(`🎤 Transcribing audio: ${audioPath}`);
    console.log(`   File size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Language: ${options.language || 'auto-detect'}`);

    // Read audio file
    const audioData = fs.readFileSync(audioPath);

    // Create FormData
    const formData = new FormData();
    const blob = new Blob([audioData], { type: 'audio/mp3' });
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('temperature', String(options.temperature || 0));

    if (options.language) {
      formData.append('language', options.language);
    }

    console.log('📤 Sending to OpenAI Whisper API...');

    const response = await axios.post(OPENAI_API_URL, formData, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      timeout: options.timeout || 600000, // 10 minutes

    });

    const data = response.data;

    console.log(`✅ Transcription received`);
    console.log(`   Text length: ${data.text.length} characters`);
    console.log(`   Language: ${data.language}`);
    console.log(`   Duration: ${data.duration.toFixed(2)}s`);

    // Parse words with timestamps
    const words = parseWords(data);

    return {
      text: data.text,
      language: data.language,
      duration: data.duration,
      words,
    };
  } catch (error) {
    console.error('❌ Whisper transcription error:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local');
      }
      if (axiosError.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Try again later.');
      }
    }

    throw error;
  }
};

/**
 * Parse words with timestamps from Whisper response
 */
const parseWords = (data: any): WordTiming[] => {
  const words: WordTiming[] = [];

  if (data.segments) {
    // Whisper returns segments with word-level timing
    data.segments.forEach((segment: any) => {
      if (segment.words) {
        segment.words.forEach((wordData: any) => {
          words.push({
            word: wordData.word.trim(),
            startTimeMs: Math.round(wordData.start * 1000),
            endTimeMs: Math.round(wordData.end * 1000),
            confidence: 0.95, // Whisper doesn't provide per-word confidence
          });
        });
      }
    });
  } else if (data.text) {
    // Fallback: split text into words and estimate timing
    console.warn('⚠️  No segment data in Whisper response. Estimating word timings...');
    const textWords = data.text.split(/\s+/);
    const totalDuration = data.duration * 1000; // Convert to milliseconds
    const timePerWord = totalDuration / textWords.length;

    textWords.forEach((word: string, index: number) => {
      words.push({
        word,
        startTimeMs: Math.round(index * timePerWord),
        endTimeMs: Math.round((index + 1) * timePerWord),
        confidence: 0.5, // Lower confidence for estimated timing
      });
    });
  }

  return words;
};

/**
 * Check if audio file is valid for Whisper
 */
export const validateAudioFile = (audioPath: string): boolean => {
  try {
    if (!fs.existsSync(audioPath)) {
      console.error(`Audio file not found: ${audioPath}`);
      return false;
    }

    const stats = fs.statSync(audioPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Whisper API limit is 25MB
    if (fileSizeMB > 25) {
      console.error(`Audio file too large: ${fileSizeMB.toFixed(2)}MB (max 25MB)`);
      return false;
    }

    if (fileSizeMB < 0.1) {
      console.error(`Audio file too small: ${fileSizeMB.toFixed(2)}MB`);
      return false;
    }

    console.log(`✅ Audio file valid: ${fileSizeMB.toFixed(2)}MB`);
    return true;
  } catch (error) {
    console.error('Error validating audio file:', error);
    return false;
  }
};

/**
 * Get audio duration
 */
export const getAudioDuration = async (audioPath: string): Promise<number> => {
  try {
    // For demo purposes, we can estimate duration from file size
    // In production, use ffprobe
    const stats = fs.statSync(audioPath);
    const fileSizeBytes = stats.size;

    // Rough estimate: MP3 at 128kbps
    const bitrate = 128000; // bits per second
    const durationSeconds = (fileSizeBytes * 8) / bitrate;

    return durationSeconds;
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 0;
  }
};

export default {
  transcribeAudio,
  validateAudioFile,
  getAudioDuration,
};
