import React, { useState, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

const AudioRecorder = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  const handleStopRecording = async (blobUrl: string | null, blob: Blob) => {
    if (blob) {
      console.log("blob", blob);
      const processedBlob = await processAudioBlob(blob);
      await sendAudioToAliyun(processedBlob);
    }
  };
  const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder(
    {
      audio: true,
      onStop: handleStopRecording,
    }
  );
  const processAudioBlob = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const offlineContext = new OfflineAudioContext(
      1,
      audioBuffer.length,
      16000
    );
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    const wavBlob = await bufferToWaveBlob(renderedBuffer);

    return wavBlob;
  };

  const bufferToWaveBlob = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      bufferArray = new ArrayBuffer(length),
      view = new DataView(bufferArray),
      channels = [],
      sampleRate = buffer.sampleRate;

    let offset = 0,
      pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF identifier
    setUint32(0x46464952);
    // file length minus RIFF identifier length and file description length
    setUint32(length - 8);
    // RIFF type
    setUint32(0x45564157);

    // format chunk identifier
    setUint32(0x20746d66);
    // format chunk length
    setUint32(16);
    // sample format (raw)
    setUint16(1);
    // channel count
    setUint16(numOfChan);
    // sample rate
    setUint32(sampleRate);
    // byte rate (sample rate * block align)
    setUint32(sampleRate * 2 * numOfChan);
    // block align (channel count * bytes per sample)
    setUint16(numOfChan * 2);
    // bits per sample
    setUint16(16);

    // data chunk identifier
    setUint32(0x61746164);
    // data chunk length
    setUint32(length - pos - 4);

    // write interleaved data
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        channels[channel] = buffer.getChannelData(channel);
        // write 16-bit sample
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(
          pos,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        pos += 2;
      }
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const sendAudioToAliyun = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "voice.wav");

    fetch("/v1/recognizeSpeech", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((result) => {
        console.log("Result: ", result);
        setTranscript(result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <p>Status: {isRecording ? "Recording..." : "Stopped"}</p>
      <p>Transcript: {transcript}</p>
      {mediaBlobUrl && <audio src={mediaBlobUrl} controls />}
    </div>
  );
};

export default AudioRecorder;
