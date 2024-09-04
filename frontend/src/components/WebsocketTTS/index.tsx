import React, { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { Howl } from "howler";
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
  const isPlayingRef = useRef(false);
  const audioQueueRef = useRef<ArrayBuffer[]>([]); // 用于存放未播放的音频数据

  const playNextAudio = () => {
    if (audioQueueRef.current.length > 0) {
      const arrayBuffer = audioQueueRef.current.shift()!;
      playAudio(arrayBuffer);
    } else {
      isPlayingRef.current = false; // 队列空时，标记停止播放
    }
  };

  const playAudio = (arrayBuffer: ArrayBuffer) => {
    const blob = new Blob([arrayBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const sound = new Howl({
      src: [url],
      format: ["wav"],
      onend: () => {
        URL.revokeObjectURL(url); // 释放资源
        playNextAudio(); // 播放队列中的下一个音频
      },
      onloaderror: () => {
        URL.revokeObjectURL(url); // 出错时也要释放资源
        playNextAudio(); // 跳过播放出错的音频，继续播放下一个
      },
      onstop: () => {
        URL.revokeObjectURL(url); // 手动停止时释放资源
        playNextAudio();
      },
    });

    sound.play();
  };

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const audioData = lastMessage.data;
      const arrayBuffer = base64ToArrayBuffer(audioData);
      audioQueueRef.current.push(arrayBuffer); // 将音频添加到队列
      if (!isPlayingRef.current) {
        isPlayingRef.current = true; // 开始播放时标记为播放中
        playNextAudio(); // 播放队列中的音频
      }
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
        const filteredText = accumulatedDiffRef.current.replace(
          /[\/\\<>{}[\]]/g,
          ""
        );
        if (filteredText) {
          sendMessage(filteredText); // 通过 WebSocket 发送累积的文本
        }
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
