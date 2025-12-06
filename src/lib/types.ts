export interface QuizQuestion {
	question: string;
	choices: string[];
	answer: number;
}

export interface QuizData {
	title: string;
	questions: QuizQuestion[];
}

export interface UserAnswer {
	questionIndex: number;
	selectedChoice: number | null;
	isCorrect: boolean | null;
	hasAnswered: boolean;
}

export interface TimerState {
	enabled: boolean;
	durationMinutes: number;
	remainingSeconds: number;
	isRunning: boolean;
}

export interface QuizState {
	allQuizzes: QuizData[];
	selectedChapters: number[];
	isQuizActive: boolean;
	isQuizCompleted: boolean;
	currentQuestionIndex: number;
	combinedQuestions: QuizQuestion[];
	userAnswers: UserAnswer[];
	timer: TimerState;
}
