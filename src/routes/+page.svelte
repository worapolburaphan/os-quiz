<script lang="ts">
	import { onMount } from 'svelte';
	import { quizStore } from '$lib/stores/quiz-store.svelte';
	import type { QuizData } from '$lib/types';
	import ChapterSelector from '$lib/components/chapter-selector.svelte';
	import TimerSettings from '$lib/components/timer-settings.svelte';
	import ScoreDisplay from '$lib/components/score-display.svelte';
	import SkipIndicator from '$lib/components/skip-indicator.svelte';
	import Timer from '$lib/components/timer.svelte';
	import QuestionDisplay from '$lib/components/question-display.svelte';
	import NavigationControls from '$lib/components/navigation-controls.svelte';
	import ResultsSummary from '$lib/components/results-summary.svelte';
	import SessionManager from '$lib/components/session-manager.svelte';

	let isLoading = $state(true);
	let loadError = $state<string | null>(null);
	let showSessionManager = $state(false);

	const isQuizActive = $derived(quizStore.state.isQuizActive);
	const isQuizCompleted = $derived(quizStore.state.isQuizCompleted);

	onMount(async () => {
		try {
			// Fetch all 10 quiz JSON files from static server
			const quizPromises = Array.from({ length: 10 }, (_, i) =>
				fetch(`/quiz-json/os${i + 1}.json`).then((res) => {
					if (!res.ok) throw new Error(`Failed to load quiz ${i + 1}`);
					return res.json();
				})
			);

			const quizzes: QuizData[] = await Promise.all(quizPromises);
			quizStore.loadQuizzes(quizzes);
			isLoading = false;
		} catch (error) {
			console.error('Error loading quizzes:', error);
			loadError = error instanceof Error ? error.message : 'Failed to load quizzes';
			isLoading = false;
		}
	});

	function handleStartQuiz() {
		quizStore.startQuiz();
	}

	function handleRestart() {
		quizStore.resetQuiz();
	}

	function handleShowSessions() {
		showSessionManager = true;
	}

	function handleCloseSessions() {
		showSessionManager = false;
	}
</script>

<svelte:head>
	<title>OS QUIZ</title>
	<meta name="description" content="แบบทดสอบระบบปฏิบัติการ OS Quiz" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	{#if isLoading}
		<!-- Loading State -->
		<div class="flex min-h-screen items-center justify-center">
			<div class="text-center">
				<div
					class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
				></div>
				<p class="text-gray-600">กำลังโหลดแบบทดสอบ...</p>
			</div>
		</div>
	{:else if loadError}
		<!-- Error State -->
		<div class="flex min-h-screen items-center justify-center p-4">
			<div class="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
				<svg class="mx-auto mb-4 h-12 w-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				<h2 class="mb-2 text-xl font-bold text-red-800">เกิดข้อผิดพลาด</h2>
				<p class="text-red-700">{loadError}</p>
			</div>
		</div>
	{:else if !isQuizActive && !isQuizCompleted}
		<!-- Chapter Selection Screen -->
		<div class="py-8">
			<ChapterSelector onStart={handleStartQuiz} onShowSessions={handleShowSessions} />
			<div class="sticky bottom-4 mx-auto mt-6 max-w-2xl px-4">
				<TimerSettings />
			</div>
		</div>
	{:else if isQuizActive}
		<!-- Quiz Screen -->
		<ScoreDisplay />
		<SkipIndicator />
		<div class="pb-20 pt-4">
			<div class="mx-auto max-w-4xl px-4 pb-4">
				<div class="flex justify-center">
					<Timer />
				</div>
			</div>
			<QuestionDisplay />
		</div>
		<NavigationControls />
	{:else if isQuizCompleted}
		<!-- Results Screen -->
		<div class="py-8">
			<ResultsSummary onRestart={handleRestart} />
		</div>
	{/if}
</div>

<!-- Session Manager Modal -->
{#if showSessionManager}
	<SessionManager onClose={handleCloseSessions} />
{/if}

