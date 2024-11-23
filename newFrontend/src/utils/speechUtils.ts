import { createParser, type EventSourceMessage } from 'eventsource-parser';
import { Toast } from '@/components/Toast';
import { StreamSpeechRequest } from '@/components/OpenOnceConversation';

interface SpeechResponse {
  success: boolean;
  data?: {
    content: string;
  };
}

// 定义响应类型接口
interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// 定义请求配置接口
interface RequestConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

// API 基础配置
const API_BASE_URL = 'http://127.0.0.1:8080';

/**
 * 通用 API 请求函数
 * @param config 请求配置
 * @returns Promise<ApiResponse>
 */
export const makeApiRequest = async (config: RequestConfig): Promise<ApiResponse> => {
  try {
    const { endpoint, method = 'POST', data, headers = {} } = config;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(`API request failed: ${error}`);
    return {
      success: false,
      message: error instanceof Error ? error.message : '请求失败',
    };
  }
};

/**
 * 检查语音命令
 * @param command 语音命令文本
 * @returns Promise<ApiResponse>
 */
export const checkVoiceCommand = async (command: string): Promise<ApiResponse> => {
  return makeApiRequest({
    endpoint: '/checkMessage',
    method: 'POST',
    data: {
      message: command,
    },
  });
};

/**
 * 处理语音合成和播放的流式响应
 * @param requestData 请求数据
 * @param audioQueue 音频队列
 * @param processAudioQueue 处理音频队列的函数
 * @param onComplete 完成后的回调函数
 */

export const handleStreamSpeech = async (command: string, onComplete?: () => void): Promise<void> => {
  try {
    const requestData: StreamSpeechRequest = {
      prompt: command,
      audioSource: 'alicloud',
      VoiceName: 'longxiaoxia',
    };

    // 创建音频队列和播放状态
    const audioQueue: string[] = [];
    let isPlaying = false;

    // 定义播放音频的函数
    const playAudio = async (audioContent: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          const audioData = atob(audioContent);
          const arrayBuffer = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            arrayBuffer[i] = audioData.charCodeAt(i);
          }

          const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = (error) => {
            URL.revokeObjectURL(audioUrl);
            reject(error);
          };

          audio.play();
        } catch (error) {
          reject(error);
        }
      });
    };

    // 处理音频队列的函数
    const processAudioQueue = async () => {
      if (isPlaying || audioQueue.length === 0) return;

      isPlaying = true;
      while (audioQueue.length > 0) {
        const content = audioQueue.shift();
        if (content) {
          try {
            await playAudio(content);
          } catch (error) {
            console.error('音频播放失败:', error);
          }
        }
      }
      isPlaying = false;
    };
    const response = await fetch('http://127.0.0.1:8080/v1/stream-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法创建流读取器');
    }

    // 创建 SSE 解析器
    const parser = createParser({
      onError(err) {
        console.error('SSE 解析错误:', err);
      },
      onEvent(event: EventSourceMessage) {
        try {
          const jsonData = JSON.parse(event.data) as SpeechResponse;
          if (jsonData.success && jsonData.data?.content) {
            // 将音频内容添加到队列
            audioQueue.push(jsonData.data.content);
            // 尝试处理队列
            processAudioQueue();
          }
        } catch (e) {
          console.error('解析音频数据失败:', e);
        }
      },
    });

    // 读取并处理 SSE 数据
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 流结束时重置解析器
        parser.reset();
        break;
      }

      const chunk = decoder.decode(value);
      parser.feed(chunk);
    }
  } catch (error) {
    console.error('语音合成请求失败:', error);
    Toast.show({
      type: 'error',
      message: '语音合成失败',
    });
  } finally {
    // 执行完成回调
    onComplete?.();
  }
};

/**
 * 播放音频文件
 * @param audioPath 音频文件路径
 * @returns Promise，音频播放完成后 resolve
 */
export const playAudio = (audioPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioPath);

    audio.onended = () => {
      resolve();
    };

    audio.onerror = (error) => {
      reject(error);
    };

    audio.play().catch(reject);
  });
};
