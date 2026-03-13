import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

function convertToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-ar',
      '16000',
      '-ac',
      '1',
      '-f',
      'wav',
      outputPath,
    ]);
    ff.on('close', code =>
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg exited with code ${code}`))
    );
    ff.on('error', reject);
  });
}

export async function POST(request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio');
  const referenceText = formData.get('referenceText') ?? '';
  const scripted = formData.get('scripted') !== 'false';

  if (!audioFile) {
    return Response.json({ error: 'No audio file provided' }, { status: 400 });
  }

  const id = randomUUID();
  const ext =
    audioFile.type?.includes('mp3') || audioFile.type?.includes('mpeg')
      ? 'mp3'
      : 'webm';
  const inputPath = join(tmpdir(), `speech-in-${id}.${ext}`);
  const wavPath = join(tmpdir(), `speech-out-${id}.wav`);

  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    await writeFile(inputPath, Buffer.from(arrayBuffer));
    await convertToWav(inputPath, wavPath);

    const wavBuffer = await readFile(wavPath);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.NEXT_PUBLIC_SPEECH_KEY,
      process.env.NEXT_PUBLIC_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage =
      process.env.NEXT_PUBLIC_LANGUAGE || 'en-US';

    const audioConfig = sdk.AudioConfig.fromWavFileInput(wavBuffer);

    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      scripted ? referenceText : '',
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      scripted
    );
    pronunciationAssessmentConfig.enableProsodyAssessment = true;

    const reco = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    reco.sessionStarted = (_s, e) => console.log(`SESSION ID: ${e.sessionId}`);
    pronunciationAssessmentConfig.applyTo(reco);

    const result = await new Promise((resolve, reject) => {
      reco.recognizeOnceAsync(
        res => {
          reco.close();
          resolve(res);
        },
        err => {
          reco.close();
          reject(new Error(err));
        }
      );
    });

    console.log('result.reason:', result.reason, '| text:', result.text);

    if (result.reason === sdk.ResultReason.Canceled) {
      const cancellation = sdk.CancellationDetails.fromResult(result);
      return Response.json(
        {
          error: `Recognition canceled: ${cancellation.reason} — ${cancellation.errorDetails}`,
        },
        { status: 422 }
      );
    }

    if (result.reason === sdk.ResultReason.NoMatch || !result.text) {
      return Response.json(
        { error: 'No speech could be recognized from the audio.' },
        { status: 422 }
      );
    }

    const pronunciationResult =
      sdk.PronunciationAssessmentResult.fromResult(result);
    const words = pronunciationResult.detailResult?.Words ?? [];

    const countError = type =>
      words.filter(w => w.PronunciationAssessment?.ErrorType === type).length;

    const output = {
      reference_text: referenceText,
      recognized_text: result.text,
      pronunciation: pronunciationResult.pronunciationScore,
      accuracy: pronunciationResult.accuracyScore,
      fluency: pronunciationResult.fluencyScore,
      completeness: pronunciationResult.completenessScore,
      prosody: pronunciationResult.prosodyScore,
      mispronunciation: countError('Mispronunciation'),
      omission: countError('Omission'),
      insertion: countError('Insertion'),
      unexpected_break: countError('UnexpectedBreak'),
      missing_break: countError('MissingBreak'),
      monotone: countError('Monotone'),
      words: words.map(word => ({
        word: word.Word,
        accuracy_score: word.PronunciationAssessment?.AccuracyScore,
        error_type: word.PronunciationAssessment?.ErrorType,
      })),
    };

    return Response.json(output);
  } catch (err) {
    console.error('Pronunciation assessment error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(wavPath).catch(() => {});
  }
}
