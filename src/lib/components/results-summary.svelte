<script lang="ts">
	import { quizStore } from '$lib/stores/quiz-store.svelte';

	interface Props {
		onRestart: () => void;
	}

	let { onRestart }: Props = $props();

	const score = $derived(quizStore.score);
	const totalQuestions = $derived(quizStore.totalQuestions);
	const percentage = $derived(quizStore.scorePercentage);
	const incorrectPercentage = $derived(quizStore.incorrectPercentage);
	const userAnswers = $derived(quizStore.state.userAnswers);
	const combinedQuestions = $derived(quizStore.state.combinedQuestions);

	const answeredQuestions = $derived(userAnswers.filter((a) => a.hasAnswered));
	const correctAnswers = $derived(answeredQuestions.filter((a) => a.isCorrect));
	const incorrectAnswers = $derived(quizStore.incorrectAnswers);

	// Get incorrect question details
	const incorrectQuestionDetails = $derived(
		incorrectAnswers.map((answer) => ({
			answer,
			question: combinedQuestions[answer.questionIndex]
		}))
	);

	let expandedQuestions = $state<Set<number>>(new Set());

	function handleRestart() {
		onRestart();
	}

	function handleRetryIncorrect() {
		quizStore.startRetryIncorrect();
	}

	function toggleQuestion(index: number) {
		const newSet = new Set(expandedQuestions);
		if (newSet.has(index)) {
			newSet.delete(index);
		} else {
			newSet.add(index);
		}
		expandedQuestions = newSet;
	}
</script>

<div class="mx-auto w-full max-w-4xl space-y-6 p-4">
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

			<!-- Percentage Breakdown -->
			<div class="grid grid-cols-2 gap-4">
				<div class="rounded-lg border border-green-200 bg-green-50 p-4">
					<div class="text-center">
						<div class="text-3xl font-bold text-green-600">{percentage}%</div>
						<div class="text-sm text-gray-600">ตอบถูก ({correctAnswers.length} ข้อ)</div>
					</div>
				</div>
				<div class="rounded-lg border border-red-200 bg-red-50 p-4">
					<div class="text-center">
						<div class="text-3xl font-bold text-red-600">{incorrectPercentage}%</div>
						<div class="text-sm text-gray-600">ตอบผิด ({incorrectAnswers.length} ข้อ)</div>
					</div>
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
					<p class="text-lg font-semibold text-green-600">🎉 เก่งมากครับ เยี่ยมๆ 🌟</p>
				{:else if percentage >= 60}
					<p class="text-lg font-semibold text-blue-600">👍 ดีมากครับ พยายามต่อไปนะ :D</p>
				{:else}
					<p class="text-lg font-semibold text-orange-600">
						💪 เกือบแล้วครับ ลองทำใหม่เพื่อเพิ่มคะแนนนะ!
					</p>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="space-y-3">
				<button
					type="button"
					onclick={handleRestart}
					class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700"
				>
					ทำแบบทดสอบใหม่
				</button>

				{#if incorrectAnswers.length > 0}
					<button
						type="button"
						onclick={handleRetryIncorrect}
						class="w-full rounded-lg border-2 border-orange-600 bg-white px-6 py-3 font-semibold text-orange-600 shadow-md transition-all hover:bg-orange-50"
					>
						ทำข้อที่ตอบผิดอีกครั้ง ({incorrectAnswers.length} ข้อ)
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Incorrect Questions List -->
	{#if incorrectQuestionDetails.length > 0}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-xl font-bold text-gray-900">ข้อที่ตอบผิด</h3>
			<div class="space-y-3">
				{#each incorrectQuestionDetails as { answer, question }, index}
					{@const isExpanded = expandedQuestions.has(answer.questionIndex)}
					<div class="rounded-lg border border-red-200 bg-red-50">
						<!-- Question Header (clickable) -->
						<button
							type="button"
							onclick={() => toggleQuestion(answer.questionIndex)}
							class="w-full p-4 text-left transition-colors hover:bg-red-100"
						>
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<div class="font-semibold text-gray-900">
										ข้อ {answer.questionIndex + 1}: {question.question.slice(0, 80)}{question
											.question.length > 80
											? '...'
											: ''}
									</div>
								</div>
								<svg
									class="h-5 w-5 text-gray-600 transition-transform {isExpanded
										? 'rotate-180'
										: ''}"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						</button>

						<!-- Expanded Details -->
						{#if isExpanded}
							<div class="border-t border-red-200 bg-white p-4">
								<div class="space-y-3">
									<!-- Full Question -->
									<div>
										<div class="mb-2 text-sm font-semibold text-gray-700">คำถาม:</div>
										<div class="text-gray-900">{question.question}</div>
									</div>

									<!-- Choices -->
									<div>
										<div class="mb-2 text-sm font-semibold text-gray-700">ตัวเลือก:</div>
										<div class="space-y-2">
											{#each question.choices as choice, choiceIndex}
												<div
													class="rounded border p-2 {choiceIndex === question.answer
														? 'border-green-500 bg-green-50'
														: choiceIndex === answer.selectedChoice
															? 'border-red-500 bg-red-50'
															: 'border-gray-200 bg-gray-50'}"
												>
													<div class="flex items-start gap-2">
														{#if choiceIndex === question.answer}
															<svg
																class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fill-rule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																	clip-rule="evenodd"
																/>
															</svg>
															<span class="text-green-800"
																>{choice} <span class="font-semibold">(คำตอบที่ถูก)</span></span
															>
														{:else if choiceIndex === answer.selectedChoice}
															<svg
																class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fill-rule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
																	clip-rule="evenodd"
																/>
															</svg>
															<span class="text-red-800"
																>{choice} <span class="font-semibold">(คุณเลือก)</span></span
															>
														{:else}
															<span class="ml-7 text-gray-600">{choice}</span>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
