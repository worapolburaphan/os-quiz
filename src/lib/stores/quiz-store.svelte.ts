import type { QuizData, QuizQuestion, UserAnswer, QuizState } from '$lib/types';

class QuizStore {
	state = $state<QuizState>({
		allQuizzes: [],
		selectedChapters: [],
		isQuizActive: false,
		isQuizCompleted: false,
		currentQuestionIndex: 0,
		combinedQuestions: [],
		userAnswers: [],
		timer: {
			enabled: false,
			durationMinutes: 5,
			remainingSeconds: 0,
			isRunning: false
		}
	});

	private timerInterval: ReturnType<typeof setInterval> | null = null;

	// Load quiz data
	loadQuizzes(quizzes: QuizData[]) {
		this.state.allQuizzes = quizzes;
	}

	// Toggle chapter selection
	toggleChapter(chapter: number) {
		const index = this.state.selectedChapters.indexOf(chapter);
		if (index > -1) {
			this.state.selectedChapters = this.state.selectedChapters.filter((c) => c !== chapter);
		} else {
			this.state.selectedChapters = [...this.state.selectedChapters, chapter].sort((a, b) => a - b);
		}
	}

	// Select all chapters
	selectAllChapters() {
		this.state.selectedChapters = Array.from({ length: 10 }, (_, i) => i + 1);
	}

	// Deselect all chapters
	deselectAllChapters() {
		this.state.selectedChapters = [];
	}

	// Start quiz
	startQuiz() {
		// Combine selected quizzes
		this.state.combinedQuestions = this.state.selectedChapters
			.map((chapter) => this.state.allQuizzes[chapter - 1]?.questions || [])
			.flat();

		// Initialize user answers
		this.state.userAnswers = this.state.combinedQuestions.map((_, index) => ({
			questionIndex: index,
			selectedChoice: null,
			isCorrect: null,
			hasAnswered: false
		}));

		this.state.currentQuestionIndex = 0;
		this.state.isQuizActive = true;
		this.state.isQuizCompleted = false;

		// Start timer if enabled
		if (this.state.timer.enabled) {
			this.state.timer.remainingSeconds = this.state.timer.durationMinutes * 60;
			this.state.timer.isRunning = true;
			this.startTimer();
		}
	}

	// Submit answer for current question
	submitAnswer(choiceIndex: number) {
		const currentAnswer = this.state.userAnswers[this.state.currentQuestionIndex];
		if (!currentAnswer) return;

		const correctAnswer = this.state.combinedQuestions[this.state.currentQuestionIndex]?.answer;
		currentAnswer.selectedChoice = choiceIndex;
		currentAnswer.isCorrect = choiceIndex === correctAnswer;
		currentAnswer.hasAnswered = true;
	}

	// Navigate to next question
	nextQuestion() {
		if (this.state.currentQuestionIndex < this.state.combinedQuestions.length - 1) {
			this.state.currentQuestionIndex++;
		} else {
			this.completeQuiz();
		}
	}

	// Navigate to previous question
	previousQuestion() {
		if (this.state.currentQuestionIndex > 0) {
			this.state.currentQuestionIndex--;
		}
	}

	// Jump to specific question
	jumpToQuestion(index: number) {
		if (index >= 0 && index < this.state.combinedQuestions.length) {
			this.state.currentQuestionIndex = index;
		}
	}

	// Complete quiz
	completeQuiz() {
		this.state.isQuizCompleted = true;
		this.state.isQuizActive = false;
		this.stopTimer();
	}

	// Reset quiz
	resetQuiz() {
		this.state.selectedChapters = [];
		this.state.isQuizActive = false;
		this.state.isQuizCompleted = false;
		this.state.currentQuestionIndex = 0;
		this.state.combinedQuestions = [];
		this.state.userAnswers = [];
		this.stopTimer();
		this.state.timer.enabled = false;
		this.state.timer.durationMinutes = 5;
		this.state.timer.remainingSeconds = 0;
		this.state.timer.isRunning = false;
	}

	// Timer functions
	setTimerDuration(minutes: number) {
		this.state.timer.durationMinutes = minutes;
	}

	toggleTimer() {
		this.state.timer.enabled = !this.state.timer.enabled;
	}

	private startTimer() {
		this.stopTimer(); // Clear any existing timer
		this.timerInterval = setInterval(() => {
			if (this.state.timer.remainingSeconds > 0) {
				this.state.timer.remainingSeconds--;
			} else {
				this.completeQuiz();
			}
		}, 1000);
	}

	pauseTimer() {
		this.state.timer.isRunning = false;
		this.stopTimer();
	}

	resumeTimer() {
		if (this.state.timer.remainingSeconds > 0) {
			this.state.timer.isRunning = true;
			this.startTimer();
		}
	}

	private stopTimer() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}

	// Computed properties
	get currentQuestion(): QuizQuestion | null {
		return this.state.combinedQuestions[this.state.currentQuestionIndex] || null;
	}

	get currentAnswer(): UserAnswer | null {
		return this.state.userAnswers[this.state.currentQuestionIndex] || null;
	}

	get totalQuestions(): number {
		return this.state.combinedQuestions.length;
	}

	get score(): number {
		return this.state.userAnswers.filter((a) => a.isCorrect === true).length;
	}

	get answeredCount(): number {
		return this.state.userAnswers.filter((a) => a.hasAnswered).length;
	}

	get skippedQuestions(): number[] {
		return this.state.userAnswers
			.filter((a) => !a.hasAnswered)
			.map((a) => a.questionIndex)
			.filter((index) => index < this.state.currentQuestionIndex);
	}

	get canGoNext(): boolean {
		return this.state.currentQuestionIndex < this.totalQuestions - 1;
	}

	get canGoPrevious(): boolean {
		return this.state.currentQuestionIndex > 0;
	}

	get scorePercentage(): number {
		if (this.answeredCount === 0) return 0;
		return Math.round((this.score / this.answeredCount) * 100);
	}
}

export const quizStore = new QuizStore();
