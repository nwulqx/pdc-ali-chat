import axios from "axios";

export const getAudio = async (data) => {
  try {
    /**
     * 注意，这里使用了两种方式请求 TTS：
     * 1, aliyun 的 tts，接口用/v1/tts {data: "上海"}
     * 2. pdc 的tts，接口用/v1/pdc/tts { input: "上海"}
     */
    const response = await axios.post(
      "/v1/pdc/tts",
      { input: data },
      {
        responseType: "blob", // 这很重要，它确保返回的是二进制数据
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching audio:", error);
    throw error;
  }
};
