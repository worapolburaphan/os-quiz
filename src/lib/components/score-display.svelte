<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	const score = $derived(quizStore.score);
	const totalQuestions = $derived(quizStore.totalQuestions);
	const answeredCount = $derived(quizStore.answeredCount);
	const percentage = $derived(quizStore.scorePercentage);
</script>

<div class="sticky top-0 z-10 bg-white shadow-md">
	<div class="mx-auto max-w-4xl px-4 py-3">
		<div class="flex items-center gap-1 justify-between sm:gap-6">
			<!-- Score -->
			<div class="flex items-center gap-1">
				<span class="text-xs font-medium text-gray-600">score:</span>
				<span class="text-sm font-bold text-blue-600">
					{score}/{answeredCount}
				</span>
			</div>

			<!-- Percentage -->
			{#if answeredCount > 0}
				<div class="flex items-center gap-1">
					<span class="text-xs font-medium text-gray-600">Rate:</span>
					<span class="text-sm font-bold text-green-600">{percentage}%</span>
				</div>
			{/if}

			<!-- Progress -->
			<div class="flex items-center gap-1">
				<span class="text-xs font-medium text-gray-600 hidden sm:inline-block">ตอบแล้ว:</span>
				<span class="text-sm font-semibold text-gray-700">
					{answeredCount}/{totalQuestions}
				</span>
			</div>
		</div>
	</div>
</div>
