# Video Rendering Skill

## نطاق المهارة
معالجة الفيديو وتجميع المشاهد والصوت والموسيقى والترجمة باستخدام FFmpeg.

## FFmpeg Basics

### التثبيت
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
choco install ffmpeg
```

### البنية الأساسية
```bash
ffmpeg -i input.mp4 -c:v codec -c:a codec output.mp4
```

## العمليات الأساسية

### 1. دمج الفيديو والصوت
```bash
# دمج فيديو بدون صوت مع ملف صوتي
ffmpeg -i video.mp4 -i audio.mp3 \
  -c:v copy -c:a aac \
  -shortest output.mp4
```

### 2. تحويل الصيغ
```bash
# تحويل MP4 إلى WebM
ffmpeg -i input.mp4 -c:v libvpx -c:a libopus output.webm

# تحويل إلى GIF
ffmpeg -i input.mp4 -vf "fps=10,scale=320:-1" output.gif
```

### 3. تقليل الحجم والجودة
```bash
# ضغط الفيديو
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 28 \
  -preset slow \
  -c:a aac -b:a 128k \
  output_compressed.mp4

# CRF values: 0-51 (lower = better quality)
```

### 4. قص الفيديو
```bash
# قص من الثانية 10 إلى 20
ffmpeg -i input.mp4 \
  -ss 10 -to 20 \
  -c copy output_trimmed.mp4
```

### 5. تغيير دقة الفيديو
```bash
# تغيير إلى 1080p
ffmpeg -i input.mp4 \
  -vf scale=1920:1080 \
  -c:v libx264 -c:a aac \
  output_1080p.mp4

# تغيير إلى 720p
ffmpeg -i input.mp4 \
  -vf scale=1280:720 \
  output_720p.mp4
```

## تجميع المشاهد

### إنشاء Concat List
```bash
# concat.txt
file 'scene1.mp4'
file 'scene2.mp4'
file 'scene3.mp4'

# تجميع المشاهد
ffmpeg -f concat -safe 0 -i concat.txt \
  -c copy output.mp4
```

### تجميع مع انتقالات
```bash
# استخدام filter_complex للانتقالات
ffmpeg -i scene1.mp4 -i scene2.mp4 \
  -filter_complex "[0]fade=t=out:st=2:d=1[v0]; \
                   [1]fade=t=in:st=0:d=1[v1]; \
                   [v0][v1]concat=n=2:v=1:a=0[v]" \
  -map "[v]" output.mp4
```

## معالجة الصوت

### استخراج الصوت
```bash
# استخراج الصوت من الفيديو
ffmpeg -i input.mp4 -q:a 9 -n audio.mp3
```

### خلط الأصوات
```bash
# دمج عدة ملفات صوتية
ffmpeg -i voice.mp3 -i background_music.mp3 \
  -filter_complex "[0]volume=0.7[a];[1]volume=0.3[b];[a][b]amix=inputs=2" \
  output_audio.mp3
```

### ضبط مستوى الصوت (Volume)
```bash
# تقليل مستوى الصوت إلى 50%
ffmpeg -i input.mp4 \
  -filter:a "volume=0.5" \
  output.mp4

# زيادة مستوى الصوت إلى 150%
ffmpeg -i input.mp4 \
  -filter:a "volume=1.5" \
  output.mp4
```

## إضافة الترجمة

### دمج ملف Subtitles
```bash
# دمج ملف SRT (subtitles)
ffmpeg -i input.mp4 -i subtitles.srt \
  -c:v copy -c:a copy \
  -c:s mov_text output.mp4
```

### توليد ملف Subtitles
```typescript
// إنشاء ملف SRT من النصوص
interface SubtitleLine {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

const generateSRT = (subtitles: SubtitleLine[]) => {
  return subtitles.map(s => 
    `${s.index}\n${s.startTime} --> ${s.endTime}\n${s.text}\n`
  ).join('\n');
};

// الكتابة إلى ملف
fs.writeFileSync('subtitles.srt', generateSRT(subtitles));
```

## معالجة متقدمة

### إضافة Watermark
```bash
# إضافة شعار في الزاوية السفلية اليمنى
ffmpeg -i video.mp4 -i logo.png \
  -filter_complex "[0][1]overlay=main_w-overlay_w-10:main_h-overlay_h-10" \
  output.mp4
```

### إضافة نص على الفيديو
```bash
# إضافة نص في أعلى الفيديو
ffmpeg -i input.mp4 \
  -vf "drawtext=textfile=text.txt:fontsize=24:fontcolor=white:y=50" \
  output.mp4
```

### قص الفيديو (Crop)
```bash
# قص 100 بكسل من الأعلى والأسفل
ffmpeg -i input.mp4 \
  -vf "crop=in_w:in_h-200" \
  output_cropped.mp4
```

## Pipeline للفيديو المتكامل

### المراحل
```bash
# 1. استخراج الصوت من الفيديو
ffmpeg -i avatar_video.mp4 avatar_audio.wav

# 2. خلط الصوت مع الموسيقى
ffmpeg -i avatar_audio.wav -i background_music.mp3 \
  -filter_complex "[0]volume=0.8[a];[1]volume=0.2[b];[a][b]amix=inputs=2" \
  final_audio.mp3

# 3. دمج الفيديو مع الصوت النهائي
ffmpeg -i avatar_video.mp4 -i final_audio.mp3 \
  -c:v libx264 -c:a aac \
  video_with_audio.mp4

# 4. إضافة الترجمة
ffmpeg -i video_with_audio.mp4 -i subtitles.srt \
  -c:s mov_text \
  final_output.mp4

# 5. ضغط النتيجة النهائية
ffmpeg -i final_output.mp4 \
  -c:v libx264 -crf 23 -preset slow \
  -c:a aac -b:a 128k \
  final_compressed.mp4
```

## TypeScript/Node.js Integration

### استخدام FFmpeg من Node.js
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function mergeVideoAndAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string
) {
  const command = `ffmpeg -i ${videoPath} -i ${audioPath} \
    -c:v copy -c:a aac -shortest ${outputPath}`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log('Merge completed:', stdout);
  } catch (error) {
    console.error('FFmpeg error:', error);
    throw error;
  }
}

// استخدام
await mergeVideoAndAudio('video.mp4', 'audio.mp3', 'output.mp4');
```

### Progress Tracking
```typescript
import { spawn } from 'child_process';

async function mergeWithProgress(
  videoPath: string,
  audioPath: string,
  outputPath: string,
  onProgress: (percent: number) => void
) {
  const ffmpeg = spawn('ffmpeg', [
    '-i', videoPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    outputPath,
  ]);
  
  let output = '';
  
  ffmpeg.stderr.on('data', (data) => {
    output += data.toString();
    
    // استخراج نسبة التقدم
    const match = output.match(/time=(\d+):(\d+):(\d+)/);
    if (match) {
      const totalSeconds = parseInt(match[1]) * 3600 + 
                          parseInt(match[2]) * 60 + 
                          parseInt(match[3]);
      const percent = (totalSeconds / videoDuration) * 100;
      onProgress(Math.min(percent, 99));
    }
  });
  
  return new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        onProgress(100);
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}
```

## أفضل الممارسات

✅ **افعل**
- استخدم codec مناسب (libx264 للتوافقية)
- احفظ النسخة الأصلية
- اختبر الحجم والجودة
- استخدم progress tracking
- احفظ الأوامر في scripts

❌ **لا تفعل**
- لا تحذف ملفات المصدر
- لا تستخدم CRF منخفض جداً (ملفات ضخمة)
- لا تغفل معالجة الأخطاء
- لا تستخدم codecs قديمة
- لا تنسى اختبار الملفات النهائية

## الموارد

- [FFmpeg Official](https://ffmpeg.org)
- [FFmpeg Wiki](https://trac.ffmpeg.org/wiki)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Node.js FFmpeg Wrapper](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

---

**آخر تحديث**: 2026-11-10
