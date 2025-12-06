<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	interface Props {
		onTimerToggle?: () => void;
	}

	let { onTimerToggle }: Props = $props();

	const timerEnabled = $derived(quizStore.state.timer.enabled);

	let durationInput = $state(quizStore.state.timer.durationMinutes);

	function handleToggle() {
		quizStore.toggleTimer();
		onTimerToggle?.();
	}

	function handleDurationChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value) || 5;
		durationInput = Math.max(1, Math.min(180, value));
		quizStore.setTimerDuration(durationInput);
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white/10 backdrop-blur-xl p-4 shadow-sm">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="font-semibold text-gray-900">ตั้งเวลา (ท้าทายตัวเอง)</h3>
			<p class="text-sm text-gray-600">เปิดใช้งานตัวจับเวลาถอยหลัง</p>
		</div>
		<button
			type="button"
			onclick={handleToggle}
			aria-label={timerEnabled ? 'ปิดใช้งานตัวจับเวลา' : 'เปิดใช้งานตัวจับเวลา'}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {timerEnabled
				? 'bg-blue-600'
				: 'bg-gray-200'}"
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {timerEnabled
					? 'translate-x-6'
					: 'translate-x-1'}"
			></span>
		</button>
	</div>

	{#if timerEnabled}
		<div class="mt-4 space-y-2">
			<label for="timer-duration" class="block text-sm font-medium text-gray-700">
				ระยะเวลา (นาที)
			</label>
			<input
				id="timer-duration"
				type="number"
				min="1"
				max="180"
				value={durationInput}
				oninput={handleDurationChange}
				class="w-full rounded-lg focus:border-blue-500 focus:ring-blue-500"
			/>
		</div>
	{/if}
</div>
