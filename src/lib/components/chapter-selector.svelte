<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	interface Props {
		onStart: () => void;
	}

	let { onStart }: Props = $props();

	const chapters = Array.from({ length: 10 }, (_, i) => i + 1);
	const allQuizzes = $derived(quizStore.state.allQuizzes);
	const selectedChapters = $derived(quizStore.state.selectedChapters);
	const allSelected = $derived(selectedChapters.length === 10);
	const canStart = $derived(selectedChapters.length > 0);

	function getQuestionCount(chapter: number): number {
		return allQuizzes[chapter - 1]?.questions.length || 0;
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
						<div class="font-semibold text-gray-900">บทที่ {chapter}</div>
						<div class="text-sm text-gray-500">{questionCount} ข้อ</div>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<!-- Summary & Start Button -->
	{#if selectedChapters.length > 0}
		<div class="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
			<div class="text-center">
				<div class="text-sm text-gray-600">จำนวนข้อที่เลือก</div>
				<div class="text-2xl font-bold text-blue-600">{getTotalSelectedQuestions()} ข้อ</div>
			</div>
			<button
				type="button"
				onclick={handleStart}
				disabled={!canStart}
				class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
			>
				เริ่มทำแบบทดสอบ
			</button>
		</div>
	{/if}
</div>
