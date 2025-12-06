<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	const canGoPrevious = $derived(quizStore.canGoPrevious);
	const canGoNext = $derived(quizStore.canGoNext);
	const currentQuestionIndex = $derived(quizStore.state.currentQuestionIndex);
	const totalQuestions = $derived(quizStore.totalQuestions);
	const currentAnswer = $derived(quizStore.currentAnswer);
	const answeredCount = $derived(quizStore.answeredCount);

	// Track selected choice from question-display
	let selectedChoice = $derived.by<number | null>(() => {
		return quizStore.state.userAnswers[currentQuestionIndex]?.selectedChoice ?? null;
	});

	$inspect('seected', selectedChoice);

	const isAnswered = $derived(currentAnswer?.hasAnswered ?? false);
	const progress = $derived((answeredCount / totalQuestions) * 100);

	function handlePrevious() {
		quizStore.previousQuestion();
	}

	function handleNext() {
		quizStore.nextQuestion();
	}

	function handleSubmitAnswer() {
		// Get the selected choice from the current answer
		if (currentAnswer && currentAnswer.selectedChoice !== null && !isAnswered) {
			quizStore.submitAnswer(currentAnswer.selectedChoice);
		}
	}
</script>

<div class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
	<div class="mx-auto max-w-4xl px-4 py-4">
		<div class="flex items-center justify-between gap-4">
			<!-- Previous Button -->
			<button
				type="button"
				onclick={handlePrevious}
				disabled={!canGoPrevious}
				class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="hidden sm:inline">ก่อนหน้า</span>
			</button>

			<!-- Progress Bar with Counter -->
			<div class="flex-1 px-4">
				<div class="mb-1 text-center text-xs font-medium text-gray-600">
					ข้อ {currentQuestionIndex + 1} / {totalQuestions}
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
					<div
						class="h-full bg-blue-600 transition-all duration-300"
						style="width: {progress}%"
					></div>
				</div>
			</div>

			<!-- Answer/Next Button -->
			{#if !isAnswered}
				<button
					type="button"
					onclick={handleSubmitAnswer}
					disabled={selectedChoice === null}
					class="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
				>
					ตอบ
				</button>
			{:else}
				<button
					type="button"
					onclick={handleNext}
					class="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white shadow-md transition-all hover:bg-green-700"
				>
					{currentQuestionIndex < totalQuestions - 1 ? 'ถัดไป' : 'ดูผลคะแนน'}
				</button>
			{/if}
		</div>
	</div>
</div>
