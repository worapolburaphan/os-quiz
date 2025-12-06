<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	interface Props {
		onStart: () => void;
		onShowSessions: () => void;
	}

	let { onStart, onShowSessions }: Props = $props();

	const chapters = Array.from({ length: 10 }, (_, i) => i + 1);
	const allQuizzes = $derived(quizStore.state.allQuizzes);
	const selectedChapters = $derived(quizStore.state.selectedChapters);
	const allSelected = $derived(selectedChapters.length === 10);
	const canStart = $derived(selectedChapters.length > 0);

	function getQuestionCount(chapter: number): number {
		return allQuizzes[chapter - 1]?.questions.length || 0;
	}

	function getQuizTitle(chapter: number): string {
		return allQuizzes[chapter - 1]?.title || `บทที่ ${chapter}`;
	}

	function getTotalSelectedQuestions(): number {
		return selectedChapters.reduce((total, chapter) => total + getQuestionCount(chapter), 0);
	}

	function handleToggleAll() {
		if (allSelected) {
			quizStore.deselectAllChapters();
		} else {
			quizStore.selectAllChapters();
		}
	}

	function handleStart() {
		if (canStart) {
			onStart();
		}
	}
</script>

<div class="mx-auto w-full max-w-2xl space-y-6 p-4">
	<div class="space-y-4">
		<h1 class="text-center text-3xl font-bold text-gray-900">แบบทดสอบระบบปฏิบัติการ</h1>
		<p class="text-center text-gray-600">เลือกบทที่ต้องการทำแบบทดสอบ</p>

		<!-- Session History Button -->
		<div class="flex justify-center">
			<button
				type="button"
				onclick={onShowSessions}
				class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
			>
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
					<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
					<path
						fill-rule="evenodd"
						d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
						clip-rule="evenodd"
					/>
				</svg>
				ประวัติการทำแบบทดสอบ
			</button>
		</div>
	</div>

	<!-- Select All Toggle -->
	<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
		<button
			type="button"
			onclick={handleToggleAll}
			class="flex w-full items-center gap-3 text-left transition-colors hover:bg-gray-50"
		>
			<input
				type="checkbox"
				checked={allSelected}
				class="rounded text-blue-600 focus:ring-blue-500"
				readonly
			/>
			<span class="font-semibold text-gray-900">
				{allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
			</span>
		</button>
	</div>

	<!-- Chapter List -->
	<div class="grid gap-3 sm:grid-cols-2">
		{#each chapters as chapter}
			{@const isSelected = selectedChapters.includes(chapter)}
			{@const questionCount = getQuestionCount(chapter)}
			{@const quizTitle = getQuizTitle(chapter)}
			<button
				type="button"
				onclick={() => quizStore.toggleChapter(chapter)}
				class="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md {isSelected
					? 'border-blue-500 bg-blue-50'
					: ''}"
			>
				<div class="flex items-start gap-3">
					<input
						type="checkbox"
						checked={isSelected}
						class="mt-1 rounded text-blue-600 focus:ring-blue-500"
						readonly
					/>
					<div class="flex-1">
						<div class="font-semibold text-sm text-blue-500">{quizTitle}</div>
						<div class="text-sm text-gray-500">{questionCount} ข้อ</div>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<!-- Summary & Start Button - Sticky Bottom Bar -->
	{#if selectedChapters.length > 0}
		<div
			class="sticky bottom-0 rounded-2xl z-10 bg-blue-500/5 backdrop-blur-md border border-gray-200 shadow-lg"
		>
			<div class="p-4 space-y-3">
				<!-- Timer Toggle Row -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium text-gray-700">Timer</span>
						<button
							type="button"
							onclick={() => quizStore.toggleTimer()}
							aria-label={quizStore.state.timer.enabled ? 'Disable timer' : 'Enable timer'}
							class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors {quizStore
								.state.timer.enabled
								? 'bg-blue-600 shadow-lg shadow-blue-500/50'
								: 'bg-gray-300'}"
						>
							<span
								class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform {quizStore
									.state.timer.enabled
									? 'translate-x-5'
									: 'translate-x-1'}"
							></span>
						</button>
						{#if quizStore.state.timer.enabled}
							<input
								type="number"
								min="1"
								max="180"
								value={quizStore.state.timer.durationMinutes}
								oninput={(e) => {
									const value = parseInt((e.target as HTMLInputElement).value) || 5;
									quizStore.setTimerDuration(Math.max(1, Math.min(180, value)));
								}}
								class="w-16 rounded border-gray-300 px-2 py-1 text-sm"
								placeholder="min"
							/>
							<span class="text-xs text-gray-500">min</span>
						{/if}
					</div>

					<!-- Question Count -->
					<div class="text-sm text-gray-600">
						<span class="font-semibold text-blue-600">{getTotalSelectedQuestions()}</span> questions
					</div>
				</div>

				<!-- Start Button -->
				<button
					type="button"
					onclick={handleStart}
					disabled={!canStart}
					class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
				>
					Start Quiz
				</button>
			</div>
		</div>
	{/if}
</div>
