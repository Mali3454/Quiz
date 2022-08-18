window.onload = function () {
	quiz.init()
}

class Quiz {
	currentQuestionIndex = -1

	async init() {
		console.log('init app')

		this.progress = document.querySelector('#progress')
		this.countDownInfo = document.querySelector('#count-down')
		this.questionHeading = document.getElementById('question-heading')

		this.answersList = document.querySelector('#answers-list')
		this.summary = document.querySelector('.summary')

		this.submitButton = document.querySelector('#submit-answer')
		this.submitButton.addEventListener('click', this.submitAnswer)

		this.restartButton = document.querySelector('#restart-quiz')
		this.restartButton.addEventListener('click', this.restartQuiz)

		await this.loadData()

		this.restartQuiz()
	}

	loadData = async () => {
		const serverData = await fetch('questions.json')
		const jsonData = await serverData.json()

		if (!jsonData.questions) {
			console.log('Brak pytań')
			return
		}

		this.quizMaxTime = jsonData.quizMaxTime * 1000
		this.questions = jsonData.questions
	}

	submitAnswer = () => {
		let userSelectedInput = document.querySelector("input[type='radio']:checked")
		//console.log(userSelectedInput);

		const userSelectedIndex = userSelectedInput.getAttribute('data-index')

		const question = this.questions[this.currentQuestionIndex]
		question.userSelectedIndex = userSelectedIndex

		if (userSelectedInput) this.setNextQuestionData()
	}

	restartQuiz = () => {
		this.questions.forEach(q => (q.userSelectedIndex = -1))

		this.currentQuestionIndex = -1
		this.countDown()
		this.setNextQuestionData()

		this.answersList.classList.remove('hide')
		this.submitButton.classList.remove('hide')
		this.restartButton.classList.remove('show')
		this.summary.classList.add('hide')
	}

	countDown = () => {
		if (!this.countDownInterval) {
			this.quizStartTime = new Date().getTime()
			this.quizEndTime = this.quizStartTime + this.quizMaxTime

			this.countDownInterval = setInterval(() => {
				const currentTime = new Date().getTime()

				if (currentTime >= this.quizEndTime) {
					console.log('Koniec quizu')
					this.stopCountDown()
					this.showSummary()
					return
				}

				let timeLeft = Math.floor((this.quizEndTime - currentTime) / 1000)

				this.countDownInfo.innerHTML = 'Pozostało: ' + timeLeft + ' sekund'
			}, 1000)
		}
	}

	stopCountDown = () => {
		clearInterval(this.countDownInterval)
		this.countDownInterval = null
		this.countDownInfo.innerHTML = ''
	}

	setNextQuestionData = () => {
		this.currentQuestionIndex++

		if (this.currentQuestionIndex >= this.questions.length) {
			console.log('Koniec quizu')
			this.showSummary()
			return
		}

		const question = this.questions[this.currentQuestionIndex]
		this.questionHeading.innerHTML = question.q

		const progressStr = `Pytanie ${this.currentQuestionIndex + 1} 
            z ${this.questions.length}`
		this.progress.innerHTML = progressStr

		const answersHtml = question.answers
			.map((answerText, index) => {
				const answerId = 'answer' + index
				return `
                <li>
                    <input type="radio" name="answer" id="${answerId}"
                        data-index="${index}" class="answer">
                    <label for="${answerId}">
                        ${answerText}
                    </label>
                </li>
            `
			})
			.join('')

		this.answersList.innerHTML = answersHtml
	}

	showSummary = () => {
		this.stopCountDown()

		this.answersList.classList.add('hide')
		this.submitButton.classList.add('hide')
		this.restartButton.classList.add('show')
		this.summary.classList.remove('hide')

		this.questionHeading.innerHTML = 'Podsumowanie wyników:'

		let numCorrectAnswers = 0

		let summaryHtml = this.questions
			.map((question, questionIndex) => {
				const answerId = 'answer' + questionIndex

				const answersHtml = question.answers
					.map((answerText, answerIndex) => {
						let classToAdd = ''
						let checkedAttr = ''

						if (question.userSelectedIndex !== undefined) {
							if (question.userSelectedIndex == question.correctAnswerNum && answerIndex == question.correctAnswerNum) {
								classToAdd = 'correct-answer'
								checkedAttr = 'checked'

								numCorrectAnswers++
							}

							if (
								question.userSelectedIndex != question.correctAnswerNum &&
								answerIndex == question.userSelectedIndex
							) {
								classToAdd = 'wrong-answer'
								checkedAttr = 'checked'
							}
						}

						return `
                    <li class="${classToAdd}">
                        <input ${checkedAttr} disabled type="radio" name="answer"
                            id="${answerId}" data-index="" class="answer">
                        <label for="${answerId}"> ${answerText} </label>
                    </li>
                `
					})
					.join('')

				this.summary.scrollTop = 0

				return `
                <h4>Pytanie nr. ${questionIndex} : ${question.q} </h4>
                <ul>
                    ${answersHtml}
                </ul>
            `
			})
			.join('')

		summaryHtml += `
            <hr>
            <h3> Ilość prawidłowych odpowiedzi: ${numCorrectAnswers} na
            ${this.questions.length} </h3>
        `

		this.summary.innerHTML = summaryHtml
	}
}

const quiz = new Quiz()
