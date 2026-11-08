/**
 * Complete Demo of Kalamek AI Pipeline
 * This script demonstrates the full workflow:
 * 1. Video upload
 * 2. Audio extraction
 * 3. Speech to text (Whisper)
 * 4. Subtitle creation
 * 5. Video export with captions
 */

import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

import { extractAudio, createAssSubtitles, getVideoInfo } from '../app/services/ffmpegService';
import { transcribeAudio, validateAudioFile } from '../app/services/whisperService';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

/**
 * Main demo flow
 */
async function runDemo() {
  console.log('\n' + '='.repeat(70));
  console.log('🎬 KALAMEK AI - COMPLETE PIPELINE DEMO');
  console.log('='.repeat(70));
  console.log('\nThis demo will guide you through the complete process:');
  console.log('  1. Select a video file');
  console.log('  2. Extract audio from the video');
  console.log('  3. Convert speech to Arabic text using Whisper AI');
  console.log('  4. Create subtitle file with word-level timing');
  console.log('  5. Edit the transcription (optional)');
  console.log('  6. Preview the subtitle formatting');
  console.log('  7. Export final video with captions\n');

  try {
    // Step 1: Get video path
    console.log('📁 STEP 1: Select Video File');
    console.log('-'.repeat(70));
    const videoPath = await question('\nEnter video file path: ');

    if (!fs.existsSync(videoPath)) {
      console.error(`❌ File not found: ${videoPath}`);
      process.exit(1);
    }

    // Get video info
    console.log('\n📹 Analyzing video...');
    const videoInfo = await getVideoInfo(videoPath);
    console.log(`   Duration: ${(videoInfo.durationMs / 1000).toFixed(2)}s`);
    console.log(`   Resolution: ${videoInfo.width}x${videoInfo.height}`);
    console.log(`   File size: ${(videoInfo.fileSizeBytes / 1024 / 1024).toFixed(2)}MB`);

    const outputDir = path.join(path.dirname(videoPath), 'kalamek_output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Step 2: Extract audio
    console.log('\n🎵 STEP 2: Extract Audio');
    console.log('-'.repeat(70));
    const audioPath = path.join(outputDir, 'extracted_audio.mp3');
    console.log('Extracting audio from video...');

    await extractAudio({
      inputPath: videoPath,
      outputPath: audioPath,
      audioRate: 16000,
    });

    if (!validateAudioFile(audioPath)) {
      throw new Error('Audio validation failed');
    }

    // Step 3: Transcribe with Whisper
    console.log('\n🤖 STEP 3: Transcribe with Whisper AI');
    console.log('-'.repeat(70));
    console.log('Sending audio to OpenAI Whisper API...');
    console.log('(This may take a few moments depending on audio length)\n');

    const transcription = await transcribeAudio(audioPath, {
      language: 'ar',
    });

    console.log('\n📝 Transcription Result:');
    console.log(`   Text: ${transcription.text}`);
    console.log(`   Language: ${transcription.language}`);
    console.log(`   Words detected: ${transcription.words.length}`);
    console.log(`   Duration: ${transcription.duration.toFixed(2)}s`);

    // Step 4: Display word timing
    console.log('\n⏱️  STEP 4: Word-Level Timing');
    console.log('-'.repeat(70));
    console.log('First 10 words with their timestamps:\n');

    transcription.words.slice(0, 10).forEach((word, index) => {
      const startTime = (word.startTimeMs / 1000).toFixed(2);
      const endTime = (word.endTimeMs / 1000).toFixed(2);
      const confidence = (word.confidence * 100).toFixed(0);
      console.log(
        `  ${index + 1}. "${word.word}" [${startTime}s - ${endTime}s] (${confidence}%)`
      );
    });

    // Step 5: Option to edit
    console.log('\n✏️  STEP 5: Edit Transcription (Optional)');
    console.log('-'.repeat(70));
    let finalText = transcription.text;
    const editChoice = await question('\nDo you want to edit the transcription? (y/n): ');

    if (editChoice.toLowerCase() === 'y') {
      console.log('\nCurrent text:');
      console.log(finalText);
      console.log('');
      finalText = await question('Enter edited text: ');
    }

    // Step 6: Preview subtitle formatting
    console.log('\n🎨 STEP 6: Subtitle Formatting Preview');
    console.log('-'.repeat(70));
    console.log('\nAvailable font sizes: 24, 32, 40, 48');
    const fontSizeStr = await question('Select font size (default: 40): ');
    const fontSize = parseInt(fontSizeStr) || 40;

    console.log('\nSubtitle preview (first line):');
    console.log(`   Font size: ${fontSize}px`);
    console.log(`   Color: White with black shadow`);
    console.log(`   Text: "${transcription.words.slice(0, 3).map((w) => w.word).join(' ')}"}`);

    // Step 7: Create subtitle file
    console.log('\n💾 STEP 7: Create Subtitle File');
    console.log('-'.repeat(70));
    const subtitlePath = path.join(outputDir, 'subtitles.ass');

    createAssSubtitles(transcription.words, subtitlePath, {
      fontSize,
      fontColor: 'H00FFFFFF', // White
      fontName: 'Cairo',
      alignment: 2, // Bottom center
    });

    console.log(`✅ Subtitle file created: ${subtitlePath}`);

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ DEMO COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log('\n📁 Generated Files:');
    console.log(`   Audio: ${audioPath}`);
    console.log(`   Subtitles: ${subtitlePath}`);
    console.log('\n📊 Summary:');
    console.log(`   Input video: ${path.basename(videoPath)}`);
    console.log(`   Transcription: ${finalText.substring(0, 80)}...`);
    console.log(`   Total words: ${transcription.words.length}`);
    console.log(`   Font size: ${fontSize}px`);
    console.log('\n🚀 Next Steps:');
    console.log('   1. The subtitle file (ASS format) can be used with FFmpeg');
    console.log('   2. Overlay subtitles on video:');
    console.log(
      `      ffmpeg -i ${path.basename(videoPath)} -vf "subtitles=${path.basename(subtitlePath)}" -y output.mp4`
    );
    console.log('   3. Upload to Kalamek AI for final editing and export\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    rl.close();
    process.exit(1);
  }
}

// Run the demo
runDemo();
