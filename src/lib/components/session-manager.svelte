<script lang="ts">
	import { onMount } from 'svelte';
	import { quizStore } from '$lib/stores/quiz-store.svelte';
	import { getSessionsList, deleteSession } from '$lib/storage/session-storage';
	import type { SessionMetadata } from '$lib/types';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let sessions = $state<SessionMetadata[]>([]);
	let isLoading = $state(true);

	onMount(async () => {
		await loadSessions();
	});

	async function loadSessions() {
		isLoading = true;
		sessions = await getSessionsList();
		isLoading = false;
	}

	async function handleLoadSession(sessionId: string) {
		const success = await quizStore.loadExistingSession(sessionId);
		if (success) {
			onClose();
		}
	}

	async function handleRetrySession(sessionId: string) {
		await quizStore.retrySessionChapters(sessionId);
		onClose();
	}

	async function handleDeleteSession(sessionId: string) {
		if (confirm('คุณต้องการลบ session นี้หรือไม่?')) {
			await deleteSession(sessionId);
			await loadSessions();
		}
	}

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatChapters(chapters: number[]): string {
		if (chapters.length === 10) return 'ทุกบท';
		if (chapters.length <= 3) return `บท ${chapters.join(', ')}`;
		return `${chapters.length} บท`;
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
	<div class="w-full max-w-4xl rounded-lg bg-white shadow-xl">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-200 p-6">
			<h2 class="text-2xl font-bold text-gray-900">ประวัติการทำแบบทดสอบ</h2>
			<button
				type="button"
				onclick={onClose}
				class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
			>
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="max-h-[70vh] overflow-y-auto p-6">
			{#if isLoading}
				<div class="flex justify-center py-12">
					<div
						class="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
					></div>
				</div>
			{:else if sessions.length === 0}
				<div class="py-12 text-center">
					<svg class="mx-auto mb-4 h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
							clip-rule="evenodd"
						/>
					</svg>
					<p class="text-lg text-gray-600">ยังไม่มีประวัติการทำแบบทดสอบ</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each sessions as session}
						<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<!-- Session Info -->
									<div class="mb-2">
										<div class="flex items-center gap-2">
											<h3 class="font-semibold text-gray-900">
												{formatChapters(session.selectedChapters)}
											</h3>
											{#if session.isCompleted}
												<span
													class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
												>
													เสร็จสิ้น
												</span>
											{:else}
												<span
													class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
												>
													กำลังทำ
												</span>
											{/if}
										</div>
										<p class="text-sm text-gray-500">{formatDate(session.timestamp)}</p>
									</div>

									<!-- Stats -->
									<div class="flex flex-wrap gap-4 text-sm">
										<div class="flex items-center gap-1">
											<span class="text-gray-600">จำนวนข้อ:</span>
											<span class="font-semibold">{session.totalQuestions}</span>
										</div>
										{#if session.isCompleted && session.score !== undefined}
											<div class="flex items-center gap-1">
												<span class="text-gray-600">คะแนน:</span>
												<span
													class="font-semibold {session.scorePercentage &&
													session.scorePercentage >= 80
														? 'text-green-600'
														: session.scorePercentage && session.scorePercentage >= 60
															? 'text-blue-600'
															: 'text-orange-600'}"
												>
													{session.score}/{session.totalQuestions} ({session.scorePercentage}%)
												</span>
											</div>
										{/if}
									</div>
								</div>

								<!-- Actions -->
								<div class="flex flex-col gap-2">
									{#if session.isCompleted}
										<button
											type="button"
											onclick={() => handleLoadSession(session.id)}
											class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
										>
											ดูผลลัพธ์
										</button>
										<button
											type="button"
											onclick={() => handleRetrySession(session.id)}
											class="rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
										>
											ทำอีกครั้ง
										</button>
									{:else}
										<button
											type="button"
											onclick={() => handleLoadSession(session.id)}
											class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
										>
											ทำต่อ
										</button>
									{/if}
									<button
										type="button"
										onclick={() => handleDeleteSession(session.id)}
										class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
									>
										ลบ
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
