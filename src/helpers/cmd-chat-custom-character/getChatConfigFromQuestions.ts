type TypeChatConfigQuestions = {
  question: string;
  answer: string;
}[];

const getChatConfigFromQuestions = (questions: TypeChatConfigQuestions) => {
  const history: { role: string; parts: string }[] = [];

  questions.forEach((question) => {
    history.push({
      role: "user",
      parts: question.question,
    });
    history.push({
      role: "model",
      parts: question.answer,
    });
  });

  return {
    history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  };
};

export default getChatConfigFromQuestions;
