import React, { useEffect, useState } from 'react';

const OpenOnceConversation: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if (!('webkitSpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }

    // @ts-expect-error - 因为 TypeScript 默认不知道 webkitSpeechRecognition
    // eslint-disable-next-line new-cap
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const currentTranscript = event.results[current][0].transcript;
      setTranscript(currentTranscript);

      // 检查是否包含"小宝"关键词
      if (currentTranscript.includes('小宝')) {
        alert('检测到关键词"小宝"！');
        // 这里可以添加你想要的响应逻辑
      }
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
    };

    // 清理函数
    return () => {
      recognition.stop();
    };
  }, [isListening]);

  return (
    <div>
      <h2>语音识别演示</h2>
      <button onClick={() => setIsListening(!isListening)}>{isListening ? '停止识别' : '开始识别'}</button>
      <div>
        <h3>识别结果：</h3>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default OpenOnceConversation;
