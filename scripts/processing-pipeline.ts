/**
 * Complete Video Processing Pipeline
 * 1. Extract audio from video
 * 2. Transcribe with Whisper
 * 3. Create subtitle file
 * 4. Overlay on video
 * 5. Export final video
 */

import * as path from 'path';
import * as fs from 'fs';
import { extractAudio, createAssSubtitles, overlaySubtitles, getVideoInfo } from '../app/services/ffmpegService';
import { transcribeAudio, validateAudioFile } from '../app/services/whisperService';

export interface PipelineConfig {
  videoPath: string;
  outputDir: string;
  language?: string;
  fontSize?: number;
  fontColor?: string;
}

export interface PipelineResult {
  success: boolean;
  videoPath?: string;
  transcription?: {
    text: string;
    language: string;
    wordCount: number;
    duration: number;
  };
  error?: string;
  timings: {
    audioExtraction: number;
    transcription: number;
    subtitleCreation: number;
    videoOverlay: number;
    totalTime: number;
  };
}

/**
 * Run complete pipeline
 */
export const runPipeline = async (config: PipelineConfig): Promise<PipelineResult> => {
  const startTime = Date.now();
  const timings = {
    audioExtraction: 0,
    transcription: 0,
    subtitleCreation: 0,
    videoOverlay: 0,
    totalTime: 0,
  };

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🎬 KALAMEK AI - VIDEO PROCESSING PIPELINE');
    console.log('='.repeat(60));
    console.log(`Input video: ${config.videoPath}`);
    console.log(`Output directory: ${config.outputDir}`);
    console.log('='.repeat(60) + '\n');

    // Validate input
    if (!fs.existsSync(config.videoPath)) {
      throw new Error(`Video file not found: ${config.videoPath}`);
    }

    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Get video info
    console.log('📹 Getting video information...');
    const videoInfo = await getVideoInfo(config.videoPath);
    console.log(`   Duration: ${(videoInfo.durationMs / 1000).toFixed(2)}s`);
    console.log(`   Resolution: ${videoInfo.width}x${videoInfo.height}`);
    console.log('');

    // Step 1: Extract Audio
    console.log('▶️  STEP 1: Extract Audio');
    console.log('-'.repeat(60));
    const audioPath = path.join(config.outputDir, 'audio.mp3');
    const audioStartTime = Date.now();

    await extractAudio({
      inputPath: config.videoPath,
      outputPath: audioPath,
      audioRate: 16000, // Whisper prefers 16kHz
    });

    timings.audioExtraction = Date.now() - audioStartTime;
    console.log(`✅ Completed in ${(timings.audioExtraction / 1000).toFixed(2)}s\n`);

    // Validate audio
    if (!validateAudioFile(audioPath)) {
      throw new Error('Audio validation failed');
    }

    // Step 2: Transcribe with Whisper
    console.log('▶️  STEP 2: Transcribe Audio with Whisper');
    console.log('-'.repeat(60));
    const transcriptionStartTime = Date.now();

    const transcription = await transcribeAudio(audioPath, {
      language: config.language || 'ar',
    });

    timings.transcription = Date.now() - transcriptionStartTime;
    console.log(`✅ Completed in ${(timings.transcription / 1000).toFixed(2)}s\n`);

    // Display transcription results
    console.log('📝 Transcription Results:');
    console.log(`   Text: "${transcription.text.substring(0, 100)}..."`);
    console.log(`   Language: ${transcription.language}`);
    console.log(`   Word count: ${transcription.words.length}`);
    console.log(`   Duration: ${transcription.duration.toFixed(2)}s`);
    console.log('');

    // Step 3: Create subtitle file
    console.log('▶️  STEP 3: Create Subtitle File');
    console.log('-'.repeat(60));
    const subtitleStartTime = Date.now();
    const subtitlePath = path.join(config.outputDir, 'subtitles.ass');

    createAssSubtitles(transcription.words, subtitlePath, {
      fontSize: config.fontSize || 40,
      fontColor: config.fontColor || 'H00FFFFFF', // White
      fontName: 'Cairo',
      alignment: 2, // Bottom center
    });

    timings.subtitleCreation = Date.now() - subtitleStartTime;
    console.log(`✅ Completed in ${(timings.subtitleCreation / 1000).toFixed(2)}s\n`);

    // Step 4: Overlay subtitles on video
    console.log('▶️  STEP 4: Overlay Subtitles on Video');
    console.log('-'.repeat(60));
    const overlayStartTime = Date.now();
    const outputVideoPath = path.join(config.outputDir, 'output_with_subtitles.mp4');

    await overlaySubtitles({
      inputPath: config.videoPath,
      outputPath: outputVideoPath,
      subtitleFile: subtitlePath,
      fontFile: 'Cairo', // Arial-like font
      fontSize: config.fontSize || 40,
      fontColor: 'white',
    });

    timings.videoOverlay = Date.now() - overlayStartTime;
    console.log(`✅ Completed in ${(timings.videoOverlay / 1000).toFixed(2)}s\n`);

    // Calculate total time
    timings.totalTime = Date.now() - startTime;

    // Display summary
    console.log('='.repeat(60));
    console.log('✅ PIPELINE COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\n📊 Processing Summary:');
    console.log(`   Audio Extraction: ${(timings.audioExtraction / 1000).toFixed(2)}s`);
    console.log(`   Transcription: ${(timings.transcription / 1000).toFixed(2)}s`);
    console.log(`   Subtitle Creation: ${(timings.subtitleCreation / 1000).toFixed(2)}s`);
    console.log(`   Video Overlay: ${(timings.videoOverlay / 1000).toFixed(2)}s`);
    console.log(`   ─────────────────────`);
    console.log(`   TOTAL TIME: ${(timings.totalTime / 1000).toFixed(2)}s`);
    console.log('');

    console.log('📁 Output Files:');
    console.log(`   Video with subtitles: ${outputVideoPath}`);
    console.log(`   Subtitles file: ${subtitlePath}`);
    console.log(`   Audio file: ${audioPath}`);
    console.log('');

    return {
      success: true,
      videoPath: outputVideoPath,
      transcription: {
        text: transcription.text,
        language: transcription.language,
        wordCount: transcription.words.length,
        duration: transcription.duration,
      },
      timings,
    };
  } catch (error) {
    console.error('\n❌ PIPELINE FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);

    timings.totalTime = Date.now() - startTime;

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timings,
    };
  }
};

/**
 * CLI Entry Point
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('❌ Usage: ts-node scripts/processing-pipeline.ts <video-path> [output-dir]');
    console.error('   Example: ts-node scripts/processing-pipeline.ts sample.mp4 ./output');
    process.exit(1);
  }

  const videoPath = args[0];
  const outputDir = args[1] || './output';
  const language = args[2] || 'ar';

  runPipeline({
    videoPath,
    outputDir,
    language,
    fontSize: 40,
    fontColor: 'white',
  }).then((result) => {
    process.exit(result.success ? 0 : 1);
  });
}

export default runPipeline;
