import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import Button from "../Button";
import {
  AudioOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import useDebugMode from "./useDebugMode";
import Toast from "../Toast";
import styles from "./index.module.less";

interface Props {
  onChange: (val: string) => void;
}

const AudioRecorder: React.FC<Props> = ({ onChange }) => {
  const [loaded, setLoaded] = useState(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [record, setRecord] = useState<any>(null);
  const [, setRecordingUrl] = useState<string | null>(null);
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const micSelectRef = useRef<HTMLSelectElement | null>(null);
  const progressRef = useRef<HTMLParagraphElement | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { debugMode } = useDebugMode();

  const silenceThreshold = -50; // dB
  const silenceDuration = 3000; // milliseconds
  let silenceTimeout: NodeJS.Timeout;

  const loadFFmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    setLoaded(true);
  };

  useEffect(() => {
    loadFFmpeg();
    createWaveSurfer();
    // RecordPlugin.getAvailableAudioDevices().then(
    //   (devices: MediaDeviceInfo[]) => {
    //     devices.forEach((device) => {
    //       const option = document.createElement("option");
    //       option.value = device.deviceId;
    //       option.text = device.label || device.deviceId;
    //       micSelectRef.current?.appendChild(option);
    //     });
    //   }
    // );
  }, []);

  const createWaveSurfer = () => {
    if (wavesurfer) {
      wavesurfer.destroy();
    }
    const ws = WaveSurfer.create({
      container: waveformRef.current!,
      waveColor: "#1890ff", // 蓝色波形图
      progressColor: "#1890ff", // 蓝色进度条
      height: 40,
      width: 200,
    });
    const rec = ws.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
      })
    );

    rec.on("record-end", (blob: Blob) => {
      const recordedUrl = URL.createObjectURL(blob);
      setRecordingUrl(recordedUrl);
      ws.load(recordedUrl);
    });

    rec.on("record-progress", (time: number) => {
      updateProgress(time);
    });

    setWavesurfer(ws);
    setRecord(rec);
  };

  const updateProgress = (time: number) => {
    const formattedTime = [
      Math.floor((time % 3600000) / 60000),
      Math.floor((time % 60000) / 1000),
    ]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");
    if (progressRef.current) {
      progressRef.current.textContent = formattedTime;
    }
  };

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = []; // Reset audio chunks

    const deviceId = micSelectRef.current?.value || undefined;
    await record.startRecording({ deviceId });
    setIsRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordingUrl(audioUrl);

      // Convert audio after recording stops
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile("input.webm", await fetchFile(audioBlob));
      await ffmpeg.exec([
        "-i",
        "input.webm",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "wav",
        "output.wav",
      ]);
      const data = await ffmpeg.readFile("output.wav");
      const convertedBlob = new Blob([data.buffer], { type: "audio/wav" });
      const convertedUrl = URL.createObjectURL(convertedBlob);
      setConvertedAudioUrl(convertedUrl);

      // Analyze the converted audio for silence
      const hasSound = await analyzeAudio(convertedBlob);
      if (hasSound) {
        uploadToServer(convertedBlob);
      } else {
        Toast.show({
          type: "warning",
          message: "识别失败：没有检测到声音",
        });
      }

      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.start();
  };

  const analyzeAudio = (blob: Blob): Promise<boolean> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const reader = new FileReader();
      reader.onload = () => {
        audioContext.decodeAudioData(reader.result as ArrayBuffer, (buffer) => {
          const data = buffer.getChannelData(0);
          const rms = Math.sqrt(
            data.reduce((sum, value) => sum + value * value, 0) / data.length
          );
          const decibels = 20 * Math.log10(rms);

          if (decibels > silenceThreshold) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      };
      reader.readAsArrayBuffer(blob);
    });
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    record.stopRecording();
    setIsRecording(false);
  };

  const uploadToServer = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "converted.wav");
    setLoading(true);
    const uploadResponse = await fetch("/v1/recognizeSpeech", {
      method: "POST",
      body: formData,
    });

    const result = await uploadResponse.text();
    console.log(result);
    const res = JSON.parse(result);
    if (res.code === "0") {
      onChange(res.data);
    } else {
      Toast.show({
        type: "warning",
        message: "识别失败",
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <div
        id="mic"
        ref={waveformRef}
        className={styles.wave}
        style={{
          display: isRecording ? "inline-block" : "none",
        }}
      />
      <div
        className={styles.chatBtn}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {loading ? (
          <LoadingOutlined />
        ) : isRecording ? (
          <CheckOutlined />
        ) : (
          <AudioOutlined />
        )}
      </div>
      {/* <select ref={micSelectRef}>
        <option value="" hidden>
          Select mic
        </option>
      </select> */}

      {convertedAudioUrl && debugMode && (
        <audio src={convertedAudioUrl} controls />
      )}
      {!loaded && debugMode ? (
        <Button onClick={loadFFmpeg}>Load S2T Manually</Button>
      ) : null}
    </div>
  );
};

export default AudioRecorder;
