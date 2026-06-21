import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../store";

export default function FlashcardScreen() {
  const nav = useNavigate();
  const { setUser } = useApp();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Nhận tín hiệu từ Iframe
      if (event.data && event.data.type === "RETURN_HOME") {
        nav("/home");
      } else if (event.data && event.data.type === "QUIZ_FINISHED") {
        // Thưởng 100 XP khi hoàn thành 1 phiên Luyện thi
        setUser(u => ({ ...u, xp: u.xp + 100 }));
        nav("/home");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [nav, setUser]);

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', background: '#fff' }}>
      <iframe 
        src={`/quiz/index.html`} 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Luyện thi Trắc nghiệm Lịch sử"
      />
    </div>
  );
}
