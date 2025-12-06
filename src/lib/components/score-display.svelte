<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	const score = $derived(quizStore.score);
	const totalQuestions = $derived(quizStore.totalQuestions);
	const answeredCount = $derived(quizStore.answeredCount);
	const percentage = $derived(quizStore.scorePercentage);
</script>

<div class="sticky top-0 z-10 bg-white shadow-md">
	<div class="mx-auto max-w-4xl px-4 py-3">
		<div class="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
			<!-- Score -->
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium text-gray-600">คะแนน:</span>
				<span class="text-xl font-bold text-blue-600">
					{score}/{answeredCount}
				</span>
			</div>

			<!-- Percentage -->
			{#if answeredCount > 0}
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium text-gray-600">เปอร์เซ็นต์:</span>
					<span class="text-xl font-bold text-green-600">{percentage}%</span>
				</div>
			{/if}

			<!-- Progress -->
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium text-gray-600">ตอบแล้ว:</span>
				<span class="text-lg font-semibold text-gray-700">
					{answeredCount}/{totalQuestions}
				</span>
			</div>
		</div>
	</div>
</div>
