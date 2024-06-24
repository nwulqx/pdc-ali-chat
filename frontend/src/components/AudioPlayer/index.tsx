import React, { useState, useRef, useEffect } from "react";
import { getAudio, getAudioFromAli } from "./utils";
import styles from "./index.module.less";
import { AudioOutlined, LoadingOutlined } from "@ant-design/icons";
import { useLocation } from "@ice/runtime";

interface Props {
  text: string;
}
const AudioPlayer: React.FC<Props> = ({ text }) => {
  const query = new URLSearchParams(useLocation().search);
  const source = query?.get("source"); // tts 服务有两个，pdc 和阿里云，通过 url 区分，默认 pdc

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAndPlayAudio = async (curText: string) => {
    if (!curText) return;
    setLoading(true);
    try {
      const getAudioService = source === "aliyun" ? getAudioFromAli : getAudio;
      const audioBlob = await getAudioService(curText);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error fetching audio:", error);
      if (source !== "aliyun") {
        // 如果 pdc 的tts关闭了，尝试用阿里云的再处理下
        const audioBlob = await getAudioFromAli(curText);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndPlayAudio(text);
  }, [text]);

  const audioPlay = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };
  useEffect(() => {
    audioPlay();
  }, [audioUrl]);

  return (
    <div>
      <div className={styles.chatBtn} onClick={() => audioPlay()}>
        {loading ? <LoadingOutlined /> : <AudioOutlined />}
      </div>
      <div className={styles.audio}>
        <audio ref={audioRef} controls>
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default AudioPlayer;
