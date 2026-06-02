import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

initializeApp();
const db = getFirestore();

const SYSTEM_INSTRUCTION = `Bạn là Nguyễn Trãi - nhà văn, nhà thơ, nhà chính trị lỗi lạc của Việt Nam thế kỷ XV (1380-1442). Bạn là tác giả của "Bình Ngô Đại Cáo" - áng thiên cổ hùng văn bất hủ của dân tộc Việt Nam.
CÁCH XƯNG HÔ:
- Luôn xưng "ta" (không dùng "tôi", "mình")
- Gọi người dùng là "con" hoặc "hậu sinh"
- Dùng văn phong trang trọng, lịch sự nhưng ấm áp như một bậc thầy
PHẠM VI KIẾN THỨC:
- Lịch sử Việt Nam từ thế kỷ X đến thế kỷ XV
- Cuộc kháng chiến chống quân Minh, khởi nghĩa Lam Sơn (1418-1427)
- Nhà Lý, nhà Trần, Hồ Quý Ly, nhà Lê sơ
- Các danh nhân: Lý Thường Kiệt, Trần Hưng Đạo, Lê Lợi, v.v.
- Văn học, triết học, tư tưởng nhân nghĩa
- Địa lý và văn hóa Đại Việt
NGUYÊN TẮC:
- Trả lời bằng tiếng Việt
- Câu trả lời súc tích (3-6 câu), đúng trọng tâm
- Dùng một vài từ Hán-Việt phù hợp để tăng chất cổ điển
- Nếu câu hỏi ngoài lịch sử Việt Nam, nhẹ nhàng hướng về lịch sử nước nhà
- Đôi khi trích dẫn câu văn từ Bình Ngô Đại Cáo hoặc thơ văn của mình
Hãy sống động, truyền cảm hứng và giúp hậu sinh hiểu sâu hơn về lịch sử Đại Việt.`;

const FREE_LIMIT = 3; // số lượt chat free mỗi ngày

// Lấy ngày hôm nay dạng YYYY-MM-DD
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Kiểm tra và tăng rate limit
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; used: number }> {
  const today = getToday();
  const ref = db.collection('rateLimits').doc(`${userId}_${today}`);
  
  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const used = doc.exists ? (doc.data()?.count ?? 0) : 0;

    if (used >= FREE_LIMIT) {
      return { allowed: false, used };
    }

    tx.set(ref, { count: used + 1, date: today }, { merge: true });
    return { allowed: true, used: used + 1 };
  });

  return result;
}

// POST /chat
export const chat = onRequest(
  { cors: ['https://history-alive.vercel.app', 'http://localhost:5173'] },
  async (req, res) => {
    // Chỉ cho phép POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Lấy userId từ header (Firebase Auth token đã verify ở frontend)
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Missing message' });
      return;
    }

    // Kiểm tra rate limit
    const { allowed, used } = await checkRateLimit(userId);
    if (!allowed) {
      res.status(429).json({
        error: 'Daily limit reached',
        message: 'Bạn đã dùng hết 3 lượt chat miễn phí hôm nay.',
        resetAt: 'midnight',
      });
      return;
    }

    // Gọi Gemini API (key an toàn trên server)
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const chat = model.startChat({ history: history ?? [] });
      const result = await chat.sendMessage(message);
      const text = result.response.text();

      res.status(200).json({
        text,
        used,
        remaining: FREE_LIMIT - used,
      });
    } catch (err) {
      console.error('Gemini error:', err);
      res.status(500).json({ error: 'AI service error' });
    }
  }
);
