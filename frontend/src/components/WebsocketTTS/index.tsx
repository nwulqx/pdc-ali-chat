import React, { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { usePrevious } from "ahooks";
import { isPunctuation } from "./utils";

interface Props {
  text: string;
  flushingTextIsNull: boolean;
}

const WebsocketTTS = ({ text, flushingTextIsNull }: Props) => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const { sendMessage, lastMessage } = useWebSocket(
    `${protocol}://${window.location.host}/ws/tts`
  );
  const previousText = usePrevious(text);
  const accumulatedDiffRef = useRef(""); // 使用 useRef 保存 accumulatedDiff
  const audioContextRef = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const audioBufferQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const audioData = lastMessage.data;

      // Decode the base64 audio data
      const arrayBuffer = base64ToArrayBuffer(audioData);
      audioContextRef.current.decodeAudioData(arrayBuffer, (buffer) => {
        audioBufferQueueRef.current.push(buffer);
        if (!isPlayingRef.current) {
          playAudio();
        }
      });
    }
  }, [lastMessage]);

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const playAudio = () => {
    if (audioBufferQueueRef.current.length > 0) {
      isPlayingRef.current = true;
      const buffer = audioBufferQueueRef.current.shift();
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer!;
      source.connect(audioContextRef.current.destination);
      source.start(0);

      source.onended = () => {
        isPlayingRef.current = false;
        playAudio();
      };
    }
  };

  useEffect(() => {
    if (text && text !== previousText) {
      // 找到两个文本之间的增量部分
      const diffContent = previousText ? text.replace(previousText, "") : text;
      accumulatedDiffRef.current += diffContent;
      // 检查最后一个字符是否为标点符号
      if (
        isPunctuation(
          accumulatedDiffRef.current[accumulatedDiffRef.current.length - 1]
        )
      ) {
        sendMessage(accumulatedDiffRef.current); // 通过 WebSocket 发送累积的文本
        accumulatedDiffRef.current = ""; // 清零差异，重新开始新的差异计算
      }
    }
  }, [text, previousText, sendMessage]);

  useEffect(() => {
    if (flushingTextIsNull && accumulatedDiffRef.current) {
      sendMessage(accumulatedDiffRef.current); // 通过 WebSocket 发送累积的文本
      accumulatedDiffRef.current = ""; // 清零差异，重新开始新的差异计算
    }
  }, [flushingTextIsNull]);
  return <></>;
};

export default WebsocketTTS;
