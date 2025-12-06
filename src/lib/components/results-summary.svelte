<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	interface Props {
		onRestart: () => void;
	}

	let { onRestart }: Props = $props();

	const score = $derived(quizStore.score);
	const totalQuestions = $derived(quizStore.totalQuestions);
	const percentage = $derived(quizStore.scorePercentage);
	const userAnswers = $derived(quizStore.state.userAnswers);

	const answeredQuestions = $derived(userAnswers.filter((a) => a.hasAnswered));
	const correctAnswers = $derived(answeredQuestions.filter((a) => a.isCorrect));
	const incorrectAnswers = $derived(answeredQuestions.filter((a) => !a.isCorrect));

	function handleRestart() {
		onRestart();
	}
</script>

<div class="mx-auto w-full max-w-2xl space-y-6 p-4">
	<!-- Result Card -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
		<div class="space-y-6">
			<!-- Title -->
			<div class="text-center">
				<h2 class="text-2xl font-bold text-gray-900">ผลคะแนน</h2>
			</div>

			<!-- Score Circle -->
			<div class="flex justify-center">
				<div
					class="flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 {percentage >=
					80
						? 'border-green-500 bg-green-50'
						: percentage >= 60
							? 'border-blue-500 bg-blue-50'
							: 'border-orange-500 bg-orange-50'}"
				>
					<div
						class="text-4xl font-bold {percentage >= 80
							? 'text-green-600'
							: percentage >= 60
								? 'text-blue-600'
								: 'text-orange-600'}"
					>
						{percentage}%
					</div>
					<div class="text-sm text-gray-600">{score}/{totalQuestions}</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-3 gap-4">
				<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
					<div class="text-2xl font-bold text-gray-900">{totalQuestions}</div>
					<div class="text-sm text-gray-600">ข้อทั้งหมด</div>
				</div>
				<div class="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
					<div class="text-2xl font-bold text-green-600">{correctAnswers.length}</div>
					<div class="text-sm text-gray-600">ถูก</div>
				</div>
				<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
					<div class="text-2xl font-bold text-red-600">{incorrectAnswers.length}</div>
					<div class="text-sm text-gray-600">ผิด</div>
				</div>
			</div>

			<!-- Message -->
			<div class="text-center">
				{#if percentage >= 80}
					<p class="text-lg font-semibold text-green-600">ยอดเยี่ยม! คุณทำได้ดีมาก</p>
				{:else if percentage >= 60}
					<p class="text-lg font-semibold text-blue-600">ดีมาก! พยายามต่อไปนะ</p>
				{:else}
					<p class="text-lg font-semibold text-orange-600">ลองทำใหม่เพื่อเพิ่มคะแนน</p>
				{/if}
			</div>

			<!-- Action Button -->
			<button
				type="button"
				onclick={handleRestart}
				class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700"
			>
				ทำแบบทดสอบใหม่
			</button>
		</div>
	</div>
</div>
