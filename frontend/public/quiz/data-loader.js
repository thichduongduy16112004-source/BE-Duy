(() => {
  const API_BASE_URL = window.HISTORY_API_BASE_URL || 'http://localhost:8000/api/v1';

  function buildAllQuestions(dataset) {
    const questions = [];
    let globalId = 1;
    dataset.topics.forEach((topic) => {
      topic.questions.forEach((question) => {
        questions.push({
          ...question,
          globalId: question.globalId || globalId,
          topicId: question.topicId || topic.id,
          topicName: question.topicName || topic.name,
          topicTitle: question.topicTitle || topic.title,
          topicIcon: question.topicIcon || topic.icon,
          topicColor: question.topicColor || topic.color,
        });
        globalId += 1;
      });
    });
    return questions;
  }

  window.loadPublishedQuizData = async function loadPublishedQuizData() {
    try {
      const response = await fetch(`${API_BASE_URL}/lesson-content/public`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const dataset = await response.json();
      if (!dataset || !Array.isArray(dataset.topics)) {
        throw new Error('Invalid dataset shape');
      }

      QUIZ_DATA = dataset;
      ALL_QUESTIONS.splice(0, ALL_QUESTIONS.length, ...buildAllQuestions(dataset));
      window.__quizDataSource = 'backend';
    } catch (error) {
      window.__quizDataSource = 'fallback-data-js';
    }
  };
})();
