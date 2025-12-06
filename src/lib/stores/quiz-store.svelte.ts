import type { QuizData, QuizQuestion, UserAnswer, QuizState, QuizSession } from '$lib/types';
import { saveSession, loadSession, generateSessionId } from '$lib/storage/session-storage';
import * as _ from 'lodash';

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
		this.state.combinedQuestions = _.shuffle(
			this.state.selectedChapters
				.map((chapter) => this.state.allQuizzes[chapter - 1]?.questions || [])
				.flat()
				.map((question) => {
					const answer = question.choices[question.answer];
					const shuffleChoices = _.shuffle(question.choices);
					const answerIndex = shuffleChoices.indexOf(answer);
					const newQuestion = {
						...question,
						choices: shuffleChoices,
						answer: answerIndex
					};
					return newQuestion;
				})
		);

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

		// Create new session
		this.state.currentSessionId = generateSessionId();
		this.autoSaveSession();

		// Start timer if enabled
		if (this.state.timer.enabled) {
			this.state.timer.remainingSeconds = this.state.timer.durationMinutes * 60;
			this.state.timer.isRunning = true;
			this.startTimer();
		}
	}

	// Select a choice (without submitting)
	selectChoice(choiceIndex: number | null) {
		const currentAnswer = this.state.userAnswers[this.state.currentQuestionIndex];
		if (!currentAnswer || currentAnswer.hasAnswered) return;
		currentAnswer.selectedChoice = choiceIndex;
	}

	// Submit answer for current question
	submitAnswer(choiceIndex: number) {
		const currentAnswer = this.state.userAnswers[this.state.currentQuestionIndex];
		if (!currentAnswer) return;

		const correctAnswer = this.state.combinedQuestions[this.state.currentQuestionIndex]?.answer;
		currentAnswer.selectedChoice = choiceIndex;
		currentAnswer.isCorrect = choiceIndex === correctAnswer;
		currentAnswer.hasAnswered = true;

		// Auto-save session after answering
		this.autoSaveSession();
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

		// Save completed session
		this.autoSaveSession(true);
	}

	// Reset quiz
	resetQuiz() {
		this.state.selectedChapters = [];
		this.state.isQuizActive = false;
		this.state.isQuizCompleted = false;
		this.state.currentQuestionIndex = 0;
		this.state.combinedQuestions = [];
		this.state.userAnswers = [];
		this.state.currentSessionId = undefined;
		this.stopTimer();
		this.state.timer.enabled = false;
		this.state.timer.durationMinutes = 5;
		this.state.timer.remainingSeconds = 0;
		this.state.timer.isRunning = false;
	}

	// Start retry quiz with only incorrect questions
	startRetryIncorrect() {
		// Get incorrect questions
		const incorrectIndices = this.state.userAnswers
			.filter((a) => a.hasAnswered && a.isCorrect === false)
			.map((a) => a.questionIndex);

		if (incorrectIndices.length === 0) return;

		// Filter combined questions to only incorrect ones
		this.state.combinedQuestions = incorrectIndices.map(
			(index) => this.state.combinedQuestions[index]
		);

		// Reset user answers for retry
		this.state.userAnswers = this.state.combinedQuestions.map((_, index) => ({
			questionIndex: index,
			selectedChoice: null,
			isCorrect: null,
			hasAnswered: false
		}));

		this.state.currentQuestionIndex = 0;
		this.state.isQuizActive = true;
		this.state.isQuizCompleted = false;

		// Create new retry session
		this.state.currentSessionId = generateSessionId();
		this.autoSaveSession();

		// Disable timer for retry
		this.state.timer.enabled = false;
		this.state.timer.isRunning = false;
	}

	// Auto-save session
	private autoSaveSession(isCompleted = false) {
		if (!this.state.currentSessionId) return;

		const session: QuizSession = {
			id: this.state.currentSessionId,
			timestamp: parseInt(this.state.currentSessionId.split('_')[1] || Date.now().toString()),
			selectedChapters: this.state.selectedChapters,
			combinedQuestions: this.state.combinedQuestions,
			userAnswers: this.state.userAnswers,
			score: this.score,
			totalQuestions: this.totalQuestions,
			scorePercentage: this.scorePercentage,
			isCompleted,
			completedAt: isCompleted ? Date.now() : undefined
		};

		saveSession(session).catch((error) => {
			console.error('Failed to save session:', error);
		});
	}

	// Load existing session
	async loadExistingSession(sessionId: string): Promise<boolean> {
		try {
			const session = await loadSession(sessionId);
			if (!session) return false;

			// Restore session state
			this.state.selectedChapters = session.selectedChapters;
			this.state.combinedQuestions = session.combinedQuestions;
			this.state.userAnswers = session.userAnswers;
			this.state.currentSessionId = session.id;
			this.state.isQuizActive = !session.isCompleted;
			this.state.isQuizCompleted = session.isCompleted;
			this.state.currentQuestionIndex = 0;

			return true;
		} catch (error) {
			console.error('Failed to load session:', error);
			return false;
		}
	}

	// Start fresh quiz with same chapters as existing session
	async retrySessionChapters(sessionId: string) {
		try {
			const session = await loadSession(sessionId);
			if (!session) return;

			this.state.selectedChapters = session.selectedChapters;
			this.startQuiz();
		} catch (error) {
			console.error('Failed to retry session:', error);
		}
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

	get incorrectAnswers(): UserAnswer[] {
		return this.state.userAnswers.filter((a) => a.hasAnswered && a.isCorrect === false);
	}

	get incorrectPercentage(): number {
		if (this.answeredCount === 0) return 0;
		return Math.round((this.incorrectAnswers.length / this.answeredCount) * 100);
	}
}

export const quizStore = new QuizStore();
