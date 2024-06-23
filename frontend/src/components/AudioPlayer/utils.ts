import axios from "axios";

export const getAudio = async (data) => {
  try {
    const response = await axios.post(
      "/v1/tts",
      { data },
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
