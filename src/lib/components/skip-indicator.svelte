<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	const skippedQuestions = $derived(quizStore.skippedQuestions);
	const skippedCount = $derived(skippedQuestions.length);

	let isOpen = $state(false);

	function handleJumpToQuestion(questionIndex: number) {
		quizStore.jumpToQuestion(questionIndex);
		isOpen = false;
	}

	function togglePanel() {
		isOpen = !isOpen;
	}
</script>

{#if skippedCount > 0}
	<div class="fixed right-4 top-20 z-20">
		<button
			type="button"
			onclick={togglePanel}
			class="relative flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white shadow-lg transition-all hover:bg-orange-600"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
					clip-rule="evenodd"
				/>
			</svg>
			<span class="text-sm">ข้าม {skippedCount}</span>
		</button>

		{#if isOpen}
			<div
				class="absolute right-0 top-12 w-64 rounded-lg border border-orange-200 bg-white shadow-xl"
			>
				<div class="border-b border-gray-200 bg-orange-50 px-4 py-2">
					<h3 class="font-semibold text-gray-900">คำถามที่ข้าม</h3>
				</div>
				<div class="max-h-80 overflow-y-auto p-2">
					<div class="space-y-1">
						{#each skippedQuestions as questionIndex}
							<button
								type="button"
								onclick={() => handleJumpToQuestion(questionIndex)}
								class="w-full rounded px-3 py-2 text-left text-sm transition-colors hover:bg-orange-50"
							>
								<span class="font-medium text-gray-700">ข้อ {questionIndex + 1}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
