
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPartyWorkAdvice = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bạn là trợ lý ảo hỗ trợ công tác Đảng, Công tác chính trị trong Quân đội nhân dân Việt Nam. 
      Hãy tư vấn về nội dung: "${topic}". 
      Yêu cầu: Sử dụng thuật ngữ quân sự chuẩn xác, bám sát Điều lệ Đảng và thực tiễn chi bộ cơ sở. 
      Câu trả lời súc tích, có tính ứng dụng cao.`
    });
    // Property text directly returns string as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Không thể kết nối với trí tuệ nhân tạo. Vui lòng kiểm tra cấu hình mạng nội bộ.";
  }
};
