const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function getPartyWorkAdvice(topic: string) {
  if (!API_KEY) {
    return "❌ Chưa cấu hình API key Gemini (.env)";
  }

  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Bạn là trợ lý ảo hỗ trợ công tác Đảng, công tác chính trị trong Quân đội nhân dân Việt Nam.
Hãy tư vấn về nội dung: "${topic}".
Yêu cầu: Sử dụng thuật ngữ quân sự chuẩn xác, bám sát Điều lệ Đảng và thực tiễn chi bộ cơ sở.
Câu trả lời súc tích, có tính ứng dụng cao.`
              }
            ]
          }
        ]
      })
    });

    const data = await res.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ AI không trả lời"
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Không thể kết nối AI";
  }
}
