import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export const runtime = 'nodejs';

export async function POST(request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio');

  if (!audioFile) {
    return Response.json({ error: 'No audio file provided' }, { status: 400 });
  }

  const arrayBuffer = await audioFile.arrayBuffer();
  const wavBuffer = Buffer.from(arrayBuffer);

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_SPEECH_KEY,
    process.env.NEXT_PUBLIC_SPEECH_REGION
  );
  speechConfig.speechRecognitionLanguage =
    process.env.NEXT_PUBLIC_LANGUAGE || 'en-US';

  const audioConfig = sdk.AudioConfig.fromWavFileInput(wavBuffer);
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  let fullText;
  try {
    fullText = await new Promise((resolve, reject) => {
      const segments = [];

      recognizer.recognized = (_s, e) => {
        if (
          e.result.reason === sdk.ResultReason.RecognizedSpeech &&
          e.result.text
        ) {
          segments.push(e.result.text);
        }
      };

      recognizer.canceled = (_s, e) => {
        recognizer.stopContinuousRecognitionAsync();
        if (e.reason === sdk.CancellationReason.Error) {
          reject(new Error(e.errorDetails));
        } else {
          resolve(segments.join(' '));
        }
      };

      recognizer.sessionStopped = () => {
        recognizer.stopContinuousRecognitionAsync();
        resolve(segments.join(' '));
      };

      recognizer.startContinuousRecognitionAsync(
        () => {},
        err => reject(new Error(err))
      );
    });
  } catch (err) {
    return Response.json(
      { error: `Speech recognition failed: ${err.message}` },
      { status: 500 }
    );
  }

  if (!fullText?.trim()) {
    return Response.json(
      { error: 'No speech could be recognized from the audio.' },
      { status: 422 }
    );
  }

  return Response.json({ user_text: fullText.trim() });
}
