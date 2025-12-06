<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	const currentQuestion = $derived(quizStore.currentQuestion);
	const currentAnswer = $derived(quizStore.currentAnswer);

	let selectedChoice = $state<number | null>(null);
	let showFeedback = $state(false);

	// Update selected choice when question changes
	$effect(() => {
		if (currentAnswer) {
			selectedChoice = currentAnswer.selectedChoice;
			showFeedback = currentAnswer.hasAnswered;
		}
	});

	function handleChoiceSelect(index: number) {
		if (!showFeedback) {
			quizStore.selectChoice(index);
		}
	}

	function getChoiceClass(index: number): string {
		if (!showFeedback) {
			return selectedChoice === index
				? 'border-blue-500 bg-blue-50'
				: 'border-gray-200 hover:border-blue-300';
		}

		// Show feedback
		const isCorrect = currentAnswer?.isCorrect;
		const correctAnswer = currentQuestion?.answer;

		if (index === correctAnswer) {
			return 'border-green-500 bg-green-50';
		}

		if (index === selectedChoice && !isCorrect) {
			return 'border-red-500 bg-red-50';
		}

		return 'border-gray-200 bg-gray-50';
	}
</script>

{#if currentQuestion}
	<div class="mx-auto w-full max-w-3xl space-y-6 p-4">
		<!-- Question Text -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold text-gray-900">{currentQuestion.question}</h2>
		</div>

		<!-- Choices -->
		<div class="space-y-3">
			{#each currentQuestion.choices as choice, index}
				<button
					type="button"
					onclick={() => handleChoiceSelect(index)}
					disabled={showFeedback}
					class="w-full rounded-lg border p-4 text-left transition-all {getChoiceClass(
						index
					)} disabled:cursor-not-allowed"
				>
					<div class="flex items-start gap-3">
						<div class="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center">
							{#if !showFeedback}
								<input
									type="radio"
									checked={selectedChoice === index}
									class="text-blue-600 focus:ring-blue-500"
									readonly
								/>
							{:else if index === currentQuestion.answer}
								<!-- Correct answer checkmark -->
								<svg
									class="h-5 w-5 text-green-600"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else if index === selectedChoice}
								<!-- Wrong answer X -->
								<svg
									class="h-5 w-5 text-red-600"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</div>
						<span class="flex-1 text-gray-900">{choice}</span>
					</div>
				</button>
			{/each}
		</div>

		<!-- Feedback Message -->
		{#if showFeedback}
			<div
				class="rounded-lg border p-4 {currentAnswer?.isCorrect
					? 'border-green-300 bg-green-50'
					: 'border-red-300 bg-red-50'}"
			>
				<div class="flex items-center gap-2">
					{#if currentAnswer?.isCorrect}
						<svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="font-semibold text-green-800">ถูกต้อง!</span>
					{:else}
						<svg class="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="font-semibold text-red-800">ไม่ถูกต้อง</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}
