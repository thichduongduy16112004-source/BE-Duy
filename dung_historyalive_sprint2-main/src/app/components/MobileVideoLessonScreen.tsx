import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import svgPaths from '../../imports/svg-ob5sphtyw1';
import { apiService } from '../services/apiService';

interface MobileVideoLessonScreenProps {
  onBack?: () => void;
}

export default function MobileVideoLessonScreen({ onBack }: MobileVideoLessonScreenProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const resumeCheckpoint = (location.state as any)?.checkpoint;

  const [lesson, setLesson] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentCheckpoint, setCurrentCheckpoint] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  const STORAGE_KEY = `lesson_checkpoint_${id}`;

  // Fetch lesson details on load
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiService.getLesson(id)
      .then(data => {
        if (data && !data.error) {
          setLesson(data);
          const questions = data.quiz_questions || [];
          setQuizQuestions(questions);
          
          // Restore checkpoint progress
          const saved = localStorage.getItem(STORAGE_KEY);
          const initialCheckpoint = saved ? Math.min(parseInt(saved, 10), questions.length) : 1;
          
          if (resumeCheckpoint && resumeCheckpoint >= 1 && resumeCheckpoint <= questions.length) {
            setCurrentCheckpoint(resumeCheckpoint);
            setShowQuiz(true);
          } else {
            setCurrentCheckpoint(initialCheckpoint || 1);
            setShowQuiz(false);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching lesson:", err);
        setLoading(false);
      });
  }, [id, resumeCheckpoint]);

  // Persist current checkpoint progress
  useEffect(() => {
    if (id && currentCheckpoint > 0) {
      localStorage.setItem(STORAGE_KEY, String(currentCheckpoint));
    }
  }, [currentCheckpoint, id]);

  const handleCheckpointClick = (checkpoint: number) => {
    if (checkpoint <= currentCheckpoint) {
      setShowQuiz(true);
      setSelectedAnswer(null);
      setQuizResult(null);
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    if (quizResult === null) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !quizQuestions.length) return;

    const currentQuestion = quizQuestions[currentCheckpoint - 1];
    if (!currentQuestion) return;

    const selectedOption = currentQuestion.options.find((opt: any) => opt.id === selectedAnswer);

    if (selectedOption?.correct) {
      setQuizResult('correct');
      setTimeout(() => {
        if (currentCheckpoint < quizQuestions.length) {
          setCurrentCheckpoint(currentCheckpoint + 1);
          setShowQuiz(false);
          setSelectedAnswer(null);
          setQuizResult(null);
        } else {
          localStorage.setItem(`lesson_completed_${id}`, 'true');
          alert('Chúc mừng! Bạn đã hoàn thành bài học!');
          navigate('/home');
        }
      }, 2000);
    } else {
      setQuizResult('wrong');
      const correctOption = currentQuestion.options.find((opt: any) => opt.correct);
      setTimeout(() => {
        navigate('/wrong-answer', {
          state: {
            lessonTitle: lesson.title,
            question: currentQuestion.question,
            wrongAnswer: `${selectedOption?.id}. ${selectedOption?.text}`,
            correctAnswer: `${correctOption?.id}. ${correctOption?.text}`,
            explanation: currentQuestion.explanation,
            returnTo: `/video-lesson/${id}`,
            checkpoint: currentCheckpoint,
            totalCheckpoints: quizQuestions.length,
          },
        });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col items-center justify-center">
        <span className="text-[#0f172a] font-bold">Đang tải bài học...</span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col items-center justify-center gap-4">
        <span className="text-red-500 font-bold">Không tìm thấy bài học!</span>
        <button onClick={() => navigate('/home')} className="bg-[#fbce03] px-4 py-2 rounded-full font-bold">Quay lại trang chủ</button>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentCheckpoint - 1];

  return (
    <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col relative overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="backdrop-blur-[6px] bg-[rgba(245,245,220,0.92)] border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between px-[16px] pt-[16px] pb-[17px] relative shrink-0">
        <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
        <button
          onClick={onBack || (() => navigate('/home'))}
          className="relative rounded-full shrink-0 w-[40px] h-[40px] flex items-center justify-center"
        >
          <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p300a1100} fill="#0F172A" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center">
          <span className="font-['Lexend',sans-serif] text-[18px] text-[#0f172a] tracking-[-0.45px] text-center font-bold">
            {lesson.title}
          </span>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="relative rounded-full shrink-0 w-[40px] h-[40px] flex items-center justify-center"
        >
          <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 14 14">
            <path d={svgPaths.p15494480} fill="#0F172A" />
          </svg>
        </button>
      </div>

      {/* Main Content Area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[24px] px-[16px] pt-[16px] pb-[120px]">
          {/* Video Player Section */}
          <div className="flex flex-col gap-[16px] w-full">
            <div className="relative w-full aspect-video rounded-[48px] overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={lesson.video_url}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <div aria-hidden="true" className="absolute border-4 border-white inset-0 pointer-events-none rounded-[48px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
            </div>

            {/* Progress & Checkpoints */}
            <div className="relative bg-white rounded-[48px] w-full">
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.07)] inset-0 pointer-events-none rounded-[48px]" />
              <div className="flex flex-col gap-[16px] p-[17px] relative w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Lexend',sans-serif] text-[12px] text-[#64748b] tracking-[1.2px] uppercase font-bold">
                    Tiến độ bài học
                  </span>
                  <div className="bg-[rgba(252,207,3,0.1)] rounded-full px-[8px] py-[4px]">
                    <span className="font-['Lexend',sans-serif] text-[12px] text-[#fccf03] font-bold">
                      Checkpoint {currentCheckpoint}
                    </span>
                  </div>
                </div>

                {/* Checkpoint Track */}
                <div className="relative flex items-center justify-between px-[8px]">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] bg-[#e2e8f0] rounded-full" style={{ top: '12px' }} />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] bg-[#fccf03] rounded-full transition-all duration-500"
                    style={{
                      top: '12px',
                      width: quizQuestions.length <= 1 ? '100%' : `${((currentCheckpoint - 1) / (quizQuestions.length - 1)) * 100}%`,
                    }}
                  />

                  {quizQuestions.map((_, index) => {
                    const cp = index + 1;
                    const isCompleted = cp < currentCheckpoint;
                    const isCurrent = cp === currentCheckpoint;

                    return (
                      <div key={cp} className="flex flex-col gap-[4px] items-center relative z-[1]">
                        {isCompleted ? (
                          <button
                            onClick={() => handleCheckpointClick(cp)}
                            className="relative bg-[#fccf03] rounded-full w-[24px] h-[24px] flex items-center justify-center p-[4px]"
                          >
                            <div aria-hidden="true" className="absolute border-4 border-white inset-0 pointer-events-none rounded-full" />
                            <svg className="w-[8.15px] h-[6.01px]" fill="none" viewBox="0 0 8.15 6.0125">
                              <path d={svgPaths.p483d100} fill="#0F172A" />
                            </svg>
                          </button>
                        ) : isCurrent ? (
                          <button
                            onClick={() => handleCheckpointClick(cp)}
                            className="relative bg-[#fccf03] rounded-full w-[32px] h-[32px] flex items-center justify-center p-[4px]"
                          >
                            <div aria-hidden="true" className="absolute border-4 border-white inset-0 pointer-events-none rounded-full shadow-[0px_0px_15px_0px_rgba(252,207,3,0.6)]" />
                            <div className="bg-[#0f172a] rounded-full w-[8px] h-[8px]" />
                          </button>
                        ) : (
                          <div className="relative bg-[#e2e8f0] rounded-full w-[24px] h-[24px] flex items-center justify-center p-[4px]">
                            <div aria-hidden="true" className="absolute border-4 border-white inset-0 pointer-events-none rounded-full" />
                            <svg className="w-[8px] h-[10.5px]" fill="none" viewBox="0 0 8 10.5">
                              <path d={svgPaths.p3e41e180} fill="#94A3B8" />
                            </svg>
                          </div>
                        )}
                        <span className={`font-['Lexend',sans-serif] text-[10px] ${isCurrent ? 'text-[#0f172a] font-bold' : isCompleted ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
                          CP{cp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Card Section */}
          {showQuiz && currentQuestion ? (
            <div className="relative bg-white rounded-[16px] w-full">
              <div className="flex flex-col overflow-hidden pt-[8px] rounded-[inherit] w-full">
                <div className="flex flex-col gap-[16px] p-[20px] w-full">
                  <div className="flex items-center">
                    <div className="bg-[rgba(252,207,3,0.2)] rounded-[16px] px-[8px] py-[2px]">
                      <span className="font-['Lexend',sans-serif] text-[10px] text-[#0f172a] tracking-[-0.5px] uppercase font-bold">
                        Câu hỏi {currentCheckpoint}/{quizQuestions.length}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-['Be_Vietnam_Pro',sans-serif] text-[20px] text-[#0f172a] tracking-[-0.5px] leading-[25px] font-bold">
                    {currentQuestion.question}
                  </h3>

                  <div className="flex flex-col gap-[12px] pt-[8px]">
                    {currentQuestion.options.map((option: any) => {
                      const isSelected = selectedAnswer === option.id;
                      const isCorrect = option.correct;
                      const showResult = quizResult !== null;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAnswerSelect(option.id)}
                          disabled={quizResult !== null}
                          className="w-full text-left cursor-pointer"
                        >
                          {showResult && isCorrect ? (
                            <div className="relative bg-[#ecfdf5] rounded-[48px] w-full">
                              <div aria-hidden="true" className="absolute border-2 border-[#10b981] inset-0 pointer-events-none rounded-[48px]" />
                              <div className="flex items-center w-full">
                                <div className="flex gap-[16px] items-center p-[18px] w-full">
                                  <div className="flex-1 flex flex-col min-w-0">
                                    <span className="font-['Lexend',sans-serif] text-[16px] text-[#064e3b] leading-[24px] font-bold">{option.text}</span>
                                    <span className="font-['Lexend',sans-serif] text-[12px] text-[#059669] font-bold">Chính xác!</span>
                                  </div>
                                  <div className="bg-[#10b981] rounded-full w-[24px] h-[24px] flex items-center justify-center shrink-0">
                                    <svg className="w-[9.5px] h-[7px]" fill="none" viewBox="0 0 9.50833 7.01458">
                                      <path d={svgPaths.p25f8ca80} fill="white" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : showResult && isSelected && !isCorrect ? (
                            <div className="relative bg-[rgba(239,68,68,0.05)] rounded-[48px] w-full">
                              <div aria-hidden="true" className="absolute border-2 border-[#ef4444] inset-0 pointer-events-none rounded-[48px]" />
                              <div className="flex items-center w-full">
                                <div className="flex gap-[16px] items-center p-[18px] w-full">
                                  <div className="flex-1 flex flex-col min-w-0">
                                    <span className="font-['Lexend',sans-serif] text-[16px] text-[#ef4444] leading-[24px] font-bold">{option.text}</span>
                                    <span className="font-['Lexend',sans-serif] text-[12px] text-[#ef4444] font-bold">Sai rồi!</span>
                                  </div>
                                  <div className="bg-[#ef4444] rounded-full w-[24px] h-[24px] flex items-center justify-center shrink-0">
                                    <svg className="w-[10px] h-[10px]" fill="none" viewBox="0 0 14 14">
                                      <path d={svgPaths.p15494480} fill="white" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : isSelected && !showResult ? (
                            <div className="relative bg-[rgba(252,207,3,0.1)] rounded-[48px] w-full">
                              <div aria-hidden="true" className="absolute border-2 border-[#fccf03] inset-0 pointer-events-none rounded-[48px]" />
                              <div className="flex items-center w-full">
                                <div className="flex gap-[16px] items-center p-[18px] w-full">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-['Lexend',sans-serif] text-[16px] text-[#0f172a] leading-[24px] font-bold">{option.text}</span>
                                  </div>
                                  <div className="bg-[#fccf03] rounded-full w-[24px] h-[24px] flex items-center justify-center shrink-0">
                                    <div className="w-[8px] h-[8px] bg-[#0f172a] rounded-full" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative bg-white rounded-[48px] w-full">
                              <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.09)] inset-0 pointer-events-none rounded-[48px]" />
                              <div className="flex items-center w-full">
                                <div className="flex gap-[16px] items-center p-[18px] w-full">
                                  <div className="flex-1 min-w-0">
                                    <span className={`font-['Lexend',sans-serif] text-[16px] text-[#0f172a] leading-[24px] ${showResult ? 'opacity-50' : 'font-bold'}`}>{option.text}</span>
                                  </div>
                                  <div className="relative rounded-full w-[24px] h-[24px] shrink-0">
                                    <div aria-hidden="true" className="absolute border-2 border-[#cbd5e1] inset-0 pointer-events-none rounded-full" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border-[#fccf03] border-t-8 inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" />
            </div>
          ) : (
            <div className="relative bg-white rounded-[16px] w-full">
              <div className="flex flex-col overflow-hidden pt-[8px] rounded-[inherit] w-full">
                <div className="flex flex-col gap-[16px] p-[20px] items-center w-full">
                  <h3 className="font-['Be_Vietnam_Pro',sans-serif] text-[20px] text-[#0f172a] tracking-[-0.5px] text-center font-bold">
                    {lesson.description}
                  </h3>
                  <p className="font-['Lexend',sans-serif] text-[14px] text-[#64748b] text-center leading-[22px]">
                    Xem video và hoàn thành quiz để mở khóa checkpoint tiếp theo!
                  </p>
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="w-full bg-[#fccf03] rounded-[16px] h-[56px] flex items-center justify-center gap-[12px] shadow-[0px_6px_0px_0px_#c4a302] active:translate-y-[2px] active:shadow-[0px_4px_0px_0px_#c4a302] transition-all mt-[8px] cursor-pointer"
                  >
                    <span className="font-['Lexend',sans-serif] text-[16px] text-[#0f172a] tracking-[0.45px] uppercase text-center">
                      Làm Quiz Checkpoint {currentCheckpoint}
                    </span>
                  </button>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border-[#fccf03] border-t-8 inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Button */}
      {showQuiz && quizResult === null && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#f5f5dc] via-[#f5f5dc] via-50% to-transparent p-[24px]">
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className={`w-full h-[64px] rounded-[16px] flex items-center justify-center gap-[12px] transition-all cursor-pointer ${
              selectedAnswer
                ? 'bg-[#fccf03] shadow-[0px_6px_0px_0px_#c4a302] active:translate-y-[2px] active:shadow-[0px_4px_0px_0px_#c4a302]'
                : 'bg-[#e2e8f0] cursor-not-allowed'
            }`}
          >
            <span className={`font-['Lexend',sans-serif] text-[18px] tracking-[0.45px] uppercase text-center ${selectedAnswer ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
              Xác nhận & Tiếp tục
            </span>
            {selectedAnswer && (
              <svg className="w-[11px] h-[14px]" fill="none" viewBox="0 0 11 14">
                <path d="M0 14V0L11 7L0 14V14" fill="#0F172A" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}