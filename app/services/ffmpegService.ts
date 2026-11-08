/**
 * FFmpeg Video Processing Service
 * Handles video extraction, audio extraction, and subtitle overlay
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface FFmpegOptions {
  inputPath: string;
  outputPath: string;
  timeout?: number;
}

export interface AudioExtractionOptions extends FFmpegOptions {
  audioCodec?: string;
  audioRate?: number;
  audioBitrate?: string;
}

export interface SubtitleOptions extends FFmpegOptions {
  subtitleFile: string;
  fontFile?: string;
  fontSize?: number;
  fontColor?: string;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface VideoExportOptions extends FFmpegOptions {
  quality?: '720p' | '1080p' | '2160p';
  videoBitrate?: string;
  audioBitrate?: string;
}

/**
 * Extract audio from video file
 */
export const extractAudio = async (options: AudioExtractionOptions): Promise<boolean> => {
  try {
    const {
      inputPath,
      outputPath,
      audioCodec = 'aac',
      audioRate = 16000, // 16kHz for Whisper
      audioBitrate = '128k',
      timeout = 300000, // 5 minutes
    } = options;

    // Validate input file
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🎵 Extracting audio from: ${inputPath}`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   Sample rate: ${audioRate}Hz`);

    const command = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-q:a', '9',
      '-acodec', audioCodec,
      '-ar', audioRate.toString(),
      '-b:a', audioBitrate,
      '-ac', '1', // Mono for Whisper
      '-y', // Overwrite output file
      `"${outputPath}"`,
    ].join(' ');

    execSync(command, {
      timeout,
      stdio: 'pipe',
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Audio extraction failed - output file not created');
    }

    const audioSize = fs.statSync(outputPath).size;
    console.log(`✅ Audio extracted: ${(audioSize / 1024 / 1024).toFixed(2)}MB`);

    return true;
  } catch (error) {
    console.error('❌ Audio extraction error:', error);
    throw error;
  }
};

/**
 * Get video information (duration, dimensions, etc.)
 */
export const getVideoInfo = async (videoPath: string) => {
  try {
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const command = [
      'ffprobe',
      '-v', 'error',
      '-show_entries', 'format=duration,size : stream=width,height,r_frame_rate',
      '-of', 'json',
      `"${videoPath}"`,
    ].join(' ');

    const output = execSync(command, { encoding: 'utf-8' });
    const data = JSON.parse(output);

    const duration = parseFloat(data.format.duration) * 1000; // Convert to milliseconds
    const width = data.streams[0]?.width || 1920;
    const height = data.streams[0]?.height || 1080;
    const size = parseInt(data.format.size) || 0;

    return {
      durationMs: Math.round(duration),
      width,
      height,
      fileSizeBytes: size,
      fps: eval(data.streams[0]?.r_frame_rate || '30'), // Convert "30000/1001" to 29.97
    };
  } catch (error) {
    console.error('❌ Error getting video info:', error);
    throw error;
  }
};

/**
 * Overlay subtitle file on video
 */
export const overlaySubtitles = async (options: SubtitleOptions): Promise<boolean> => {
  try {
    const {
      inputPath,
      outputPath,
      subtitleFile,
      fontFile,
      fontSize = 32,
      fontColor = 'white',
      shadowColor = 'black',
      shadowOffsetX = 2,
      shadowOffsetY = 2,
      borderColor = 'black',
      borderWidth = 1,
      timeout = 600000, // 10 minutes
    } = options;

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input video not found: ${inputPath}`);
    }

    if (!fs.existsSync(subtitleFile)) {
      throw new Error(`Subtitle file not found: ${subtitleFile}`);
    }

    // Create output directory
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📝 Overlaying subtitles...`);
    console.log(`   Video: ${inputPath}`);
    console.log(`   Subtitles: ${subtitleFile}`);
    console.log(`   Font size: ${fontSize}`);

    // Build subtitle filter
    let subtitleFilter = `subtitles='${subtitleFile.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

    // Add font styling if provided
    if (fontFile) {
      subtitleFilter = `subtitles='${subtitleFile.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      // Font styling is applied via subtitle file formatting
    }

    const command = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-vf', `"${subtitleFilter}"`,
      '-c:v', 'libx264',
      '-preset', 'medium', // medium quality/speed tradeoff
      '-crf', '22', // Quality (lower = better)
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y',
      `"${outputPath}"`,
    ].join(' ');

    execSync(command, {
      timeout,
      stdio: 'pipe',
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Subtitle overlay failed - output file not created');
    }

    const outputSize = fs.statSync(outputPath).size;
    console.log(`✅ Video with subtitles exported: ${(outputSize / 1024 / 1024).toFixed(2)}MB`);

    return true;
  } catch (error) {
    console.error('❌ Subtitle overlay error:', error);
    throw error;
  }
};

/**
 * Create SRT subtitle file from words array
 */
export const createSrtSubtitles = (
  words: Array<{
    word: string;
    startTimeMs: number;
    endTimeMs: number;
  }>,
  outputPath: string
): boolean => {
  try {
    const msToTimestamp = (ms: number): string => {
      const totalSeconds = Math.floor(ms / 1000);
      const milliseconds = ms % 1000;
      const seconds = totalSeconds % 60;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const hours = Math.floor(totalSeconds / 3600);

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
    };

    let srtContent = '';
    words.forEach((word, index) => {
      srtContent += `${index + 1}\n`;
      srtContent += `${msToTimestamp(word.startTimeMs)} --> ${msToTimestamp(word.endTimeMs)}\n`;
      srtContent += `${word.word}\n\n`;
    });

    fs.writeFileSync(outputPath, srtContent, 'utf-8');
    console.log(`✅ SRT file created: ${outputPath}`);

    return true;
  } catch (error) {
    console.error('❌ Error creating SRT file:', error);
    throw error;
  }
};

/**
 * Create ASS subtitle file (for advanced styling)
 */
export const createAssSubtitles = (
  words: Array<{
    word: string;
    startTimeMs: number;
    endTimeMs: number;
  }>,
  outputPath: string,
  options?: {
    fontSize?: number;
    fontColor?: string;
    fontName?: string;
    alignment?: number;
  }
): boolean => {
  try {
    const fontSize = options?.fontSize || 32;
    const fontColor = options?.fontColor || 'H00FFFFFF'; // BGR format for white
    const fontName = options?.fontName || 'Arial';
    const alignment = options?.alignment || 2; // 2 = bottom center

    const msToTimestamp = (ms: number): string => {
      const totalSeconds = Math.floor(ms / 1000);
      const centiseconds = Math.floor((ms % 1000) / 10);
      const seconds = totalSeconds % 60;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const hours = Math.floor(totalSeconds / 3600);

      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
    };

    // ASS header
    let assContent = `[Script Info]
Title: Kalamek AI Subtitles
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${fontColor},&H00000000,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,${alignment},0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    words.forEach((word) => {
      const start = msToTimestamp(word.startTimeMs);
      const end = msToTimestamp(word.endTimeMs);
      assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${word.word}\n`;
    });

    fs.writeFileSync(outputPath, assContent, 'utf-8');
    console.log(`✅ ASS file created: ${outputPath}`);

    return true;
  } catch (error) {
    console.error('❌ Error creating ASS file:', error);
    throw error;
  }
};

/**
 * Export video with specified quality
 */
export const exportVideo = async (options: VideoExportOptions): Promise<boolean> => {
  try {
    const {
      inputPath,
      outputPath,
      quality = '1080p',
      videoBitrate = '2500k',
      audioBitrate = '128k',
      timeout = 600000,
    } = options;

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📹 Exporting video (${quality})...`);

    const command = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-b:v', videoBitrate,
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-y',
      `"${outputPath}"`,
    ].join(' ');

    execSync(command, {
      timeout,
      stdio: 'pipe',
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Export failed - output file not created');
    }

    const outputSize = fs.statSync(outputPath).size;
    console.log(`✅ Video exported: ${(outputSize / 1024 / 1024).toFixed(2)}MB`);

    return true;
  } catch (error) {
    console.error('❌ Export error:', error);
    throw error;
  }
};

export default {
  extractAudio,
  getVideoInfo,
  overlaySubtitles,
  createSrtSubtitles,
  createAssSubtitles,
  exportVideo,
};
