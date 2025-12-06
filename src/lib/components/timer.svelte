<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	const timerState = $derived(quizStore.state.timer);
	const remainingSeconds = $derived(timerState.remainingSeconds);
	const isRunning = $derived(timerState.isRunning);
	const isLowTime = $derived(remainingSeconds < 60 && remainingSeconds > 0);

	const minutes = $derived(Math.floor(remainingSeconds / 60));
	const seconds = $derived(remainingSeconds % 60);

	function formatTime(mins: number, secs: number): string {
		const m = mins.toString().padStart(2, '0');
		const s = secs.toString().padStart(2, '0');
		return `${m}:${s}`;
	}

	function handlePause() {
		quizStore.pauseTimer();
	}

	function handleResume() {
		quizStore.resumeTimer();
	}
</script>

{#if timerState.enabled}
	<div
		class="flex items-center gap-3 rounded-lg border px-4 py-2 {isLowTime
			? 'border-red-300 bg-red-50'
			: 'border-gray-200 bg-white'}"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5 {isLowTime ? 'text-red-600' : 'text-gray-600'}"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
				clip-rule="evenodd"
			/>
		</svg>
		<span class="text-lg font-bold {isLowTime ? 'text-red-600' : 'text-gray-900'} tabular-nums">
			{formatTime(minutes, seconds)}
		</span>
		<button
			type="button"
			onclick={isRunning ? handlePause : handleResume}
			class="rounded px-2 py-1 text-sm font-medium transition-colors {isRunning
				? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
				: 'bg-green-100 text-green-700 hover:bg-green-200'}"
		>
			{isRunning ? 'หยุด' : 'ดำเนินต่อ'}
		</button>
	</div>
{/if}
