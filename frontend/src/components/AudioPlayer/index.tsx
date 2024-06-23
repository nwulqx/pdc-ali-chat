import React, { useState, useRef, useEffect } from "react";
import { getAudio } from "./utils";
import styles from "./index.module.less";
import { AudioOutlined, LoadingOutlined } from "@ant-design/icons";

interface Props {
  text: string;
}
const AudioPlayer: React.FC<Props> = ({ text }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAndPlayAudio = async (curText: string) => {
    if (!curText) return;
    setLoading(true);
    try {
      const audioBlob = await getAudio(curText);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndPlayAudio(text);
  }, [text]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div>
      <div className={styles.chatBtn} onClick={() => fetchAndPlayAudio(text)}>
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
