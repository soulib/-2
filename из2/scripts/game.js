document.addEventListener('DOMContentLoaded', () => {
    // 1. Состояние игры
    const gameState = {
        dice: [1, 1, 1, 1, 1],
        held: [false, false, false, false, false],
        rollCount: 0,
        scores: {
            Aces: null, Twos: null, Threes: null,
            Fours: null, Fives: null, Sixes: null,
            'For Bonus': 0,
            '3 of a kind': null,
            '4 of a kind': null,
            'Full House': null,
            'Small Straight': null,
            'Large Straight': null,
            'Chance': null,
            'Yahtzee': null,
            'Total Sum': 0
        },
        gameEnded: false,
        roundsPlayed: 0
    };

    // 2. Получаем элементы DOM
    const elements = {
        diceContainer: document.getElementById('diceContainer'),
        rollButton: document.getElementById('rollButton'),
        endTurnButton: document.getElementById('endTurnButton'),
        rollCount: document.getElementById('rollCount'),
        celebration: document.getElementById('celebration'),
        gameOver: document.getElementById('gameOver'),
        resultText: document.getElementById('resultText'),
        playAgainButton: document.getElementById('playAgainButton'),
        scoreCells: {}
    };

    // Инициализация ячеек счета
    const scoreCategories = [
        'Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
        'For Bonus', '3 of a kind', '4 of a kind', 'Full House',
        'Small Straight', 'Large Straight', 'Chance', 'Yahtzee', 'Total Sum'
    ];

    scoreCategories.forEach(category => {
        elements.scoreCells[category] = document.getElementById(category);
    });

    // 3. Функции для анимаций
    function createConfetti() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'];
        
        elements.celebration.innerHTML = '';
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
            confetti.style.animationDelay = Math.random() * 2 + 's';
            elements.celebration.appendChild(confetti);
        }
        
        elements.celebration.style.display = 'block';
        
        setTimeout(() => {
            elements.celebration.innerHTML = '';
            elements.celebration.style.display = 'none';
        }, 5000);
    }

    function showResult(isWin) {
        elements.resultText.innerHTML = isWin 
            ? '<div class="win-text">Победа! 🎉</div>' 
            : '<div class="lose-text">Попробуйте еще раз! 😊</div>';
        
        elements.gameOver.style.display = 'flex';
        
        if (isWin) {
            createConfetti();
        }
    }

    // 4. Функции для работы с кубиками
    function createDiceFace(value, index) {
        const die = document.createElement('div');
        die.className = `die ${gameState.held[index] ? 'held' : ''}`;
        die.dataset.index = index;
        
        // Очищаем предыдущие точки
        die.innerHTML = '';
        
        // Позиции точек для каждого значения кубика
        const dotPositions = {
            1: [[50, 50]],
            2: [[25, 25], [75, 75]],
            3: [[25, 25], [50, 50], [75, 75]],
            4: [[25, 25], [25, 75], [75, 25], [75, 75]],
            5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
            6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
        };
        
        // Создаем точки на кубике
        dotPositions[value].forEach(pos => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = `${pos[0]}%`;
            dot.style.top = `${pos[1]}%`;
            die.appendChild(dot);
        });
        
        die.addEventListener('click', () => toggleHold(index));
        return die;
    }

    function toggleHold(index) {
        if (gameState.rollCount === 0) return;
        gameState.held[index] = !gameState.held[index];
        renderDice();
    }

    function renderDice() {
        elements.diceContainer.innerHTML = '';
        gameState.dice.forEach((value, index) => {
            elements.diceContainer.appendChild(createDiceFace(value, index));
        });
    }

    // 5. Анимация броска кубиков
    function rollDice() {
        return new Promise((resolve) => {
            const diceElements = document.querySelectorAll('.die');
            let completedAnimations = 0;
            
            diceElements.forEach((die, index) => {
                if (!gameState.held[index]) {
                    die.classList.add('rolling');
                    
                    // Анимация изменения значений во время броска
                    const interval = setInterval(() => {
                        const randomValue = Math.floor(Math.random() * 6) + 1;
                        die.innerHTML = '';
                        
                        const dotPositions = {
                            1: [[50, 50]],
                            2: [[25, 25], [75, 75]],
                            3: [[25, 25], [50, 50], [75, 75]],
                            4: [[25, 25], [25, 75], [75, 25], [75, 75]],
                            5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
                            6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
                        };
                        
                        dotPositions[randomValue].forEach(pos => {
                            const dot = document.createElement('div');
                            dot.className = 'dot';
                            dot.style.left = `${pos[0]}%`;
                            dot.style.top = `${pos[1]}%`;
                            die.appendChild(dot);
                        });
                    }, 100);
                    
                    setTimeout(() => {
                        clearInterval(interval);
                        die.classList.remove('rolling');
                        completedAnimations++;
                        if (completedAnimations === diceElements.length - gameState.held.filter(h => h).length) {
                            resolve();
                        }
                    }, 1000);
                } else {
                    completedAnimations++;
                    if (completedAnimations === diceElements.length - gameState.held.filter(h => h).length) {
                        resolve();
                    }
                }
            });
        });
    }

    // 6. Основные игровые функции
    async function rollDiceHandler() {
        if (gameState.rollCount >= 3) return;
        
        elements.rollButton.disabled = true;
        await rollDice();
        
        // Устанавливаем финальные значения после анимации
        gameState.dice = gameState.dice.map((val, i) => 
            gameState.held[i] ? val : Math.floor(Math.random() * 6) + 1
        );
        
        gameState.rollCount++;
        renderDice();
        updateControls();
        elements.rollButton.disabled = false;
        
        if (gameState.rollCount === 3) {
            calculateScores();
            updateScoreboard();
        }
    }

    function calculateScores() {
        const counts = [0, 0, 0, 0, 0, 0];
        gameState.dice.forEach(die => counts[die-1]++);
        
        // Верхняя секция (Aces-Sixes)
        for (let i = 0; i < 6; i++) {
            const value = i + 1;
            const count = counts[i];
            const category = ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'][i];
            
            if (gameState.scores[category] === null) {
                gameState.scores[category] = count * value;
            }
        }
        
        // Бонус
        const upperSum = ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes']
            .reduce((sum, cat) => sum + (gameState.scores[cat] || 0), 0);
        
        gameState.scores['For Bonus'] = upperSum >= 63 ? 35 : 0;
        
        // Нижняя секция (комбинации)
        if (gameState.scores['3 of a kind'] === null) {
            gameState.scores['3 of a kind'] = counts.some(c => c >= 3) ? 
                gameState.dice.reduce((a, b) => a + b, 0) : 0;
        }
        
        if (gameState.scores['4 of a kind'] === null) {
            gameState.scores['4 of a kind'] = counts.some(c => c >= 4) ? 
                gameState.dice.reduce((a, b) => a + b, 0) : 0;
        }
        
        if (gameState.scores['Full House'] === null) {
            gameState.scores['Full House'] = counts.some(c => c === 3) && counts.some(c => c === 2) ? 25 : 0;
        }
        
        if (gameState.scores['Small Straight'] === null) {
            const hasSmallStraight = 
                (counts[0] && counts[1] && counts[2] && counts[3]) || // 1-4
                (counts[1] && counts[2] && counts[3] && counts[4]) || // 2-5
                (counts[2] && counts[3] && counts[4] && counts[5]);   // 3-6
            gameState.scores['Small Straight'] = hasSmallStraight ? 30 : 0;
        }
        
        if (gameState.scores['Large Straight'] === null) {
            const hasLargeStraight = 
                (counts[0] && counts[1] && counts[2] && counts[3] && counts[4]) || // 1-5
                (counts[1] && counts[2] && counts[3] && counts[4] && counts[5]);   // 2-6
            gameState.scores['Large Straight'] = hasLargeStraight ? 40 : 0;
        }
        
        if (gameState.scores['Chance'] === null) {
            gameState.scores['Chance'] = gameState.dice.reduce((a, b) => a + b, 0);
        }
        
        if (gameState.scores['Yahtzee'] === null) {
            gameState.scores['Yahtzee'] = counts.some(c => c === 5) ? 50 : 0;
        }
        
        // Общий счет
        gameState.scores['Total Sum'] = Object.entries(gameState.scores)
            .filter(([key]) => key !== 'For Bonus' && key !== 'Total Sum')
            .reduce((sum, [key, value]) => sum + (value || 0), 0) + 
            gameState.scores['For Bonus'];
    }

    function updateScoreboard() {
        for (const [category, cell] of Object.entries(elements.scoreCells)) {
            if (!cell) continue;
            
            const score = gameState.scores[category];
            cell.textContent = score !== null ? score : '';
            
            if (!['For Bonus', 'Total Sum'].includes(category)) {
                cell.style.color = score > 0 ? '#27ae60' : score === 0 ? '#000' : '';
            }
        }
    }

    function endTurn() {
        calculateScores();
        updateScoreboard();
        
        // Проверяем условия победы
        const positiveScores = scoreCategories.slice(0, 6)
            .filter(key => gameState.scores[key] > 0).length;
        
        const isWin = positiveScores >= 3;
        showResult(isWin);
        
        gameState.roundsPlayed++;
        gameState.rollCount = 0;
        gameState.held = [false, false, false, false, false];
        gameState.dice = [1, 1, 1, 1, 1];
        updateControls();
        renderDice();
    }

    // 7. Вспомогательные функции
    function updateControls() {
        elements.rollCount.textContent = 3 - gameState.rollCount;
        elements.rollButton.disabled = gameState.rollCount >= 3;
        elements.endTurnButton.disabled = gameState.rollCount === 0;
    }

    function resetGame() {
        gameState.dice = [1,1,1,1,1];
        gameState.held = [false,false,false,false,false];
        gameState.rollCount = 0;
        gameState.gameEnded = false;
        gameState.roundsPlayed = 0;
        gameState.scores = {
            Aces: null, Twos: null, Threes: null,
            Fours: null, Fives: null, Sixes: null,
            'For Bonus': 0,
            '3 of a kind': null,
            '4 of a kind': null,
            'Full House': null,
            'Small Straight': null,
            'Large Straight': null,
            'Chance': null,
            'Yahtzee': null,
            'Total Sum': 0
        };
        updateScoreboard();
        renderDice();
        updateControls();
        elements.gameOver.style.display = 'none';
    }

    // 8. Инициализация игры
    function initGame() {
        // Добавляем кнопку сброса
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Новая игра';
        resetBtn.addEventListener('click', resetGame);
        document.querySelector('.controls').appendChild(resetBtn);

        // Обработчик кнопки "Играть снова"
        elements.playAgainButton.addEventListener('click', () => {
            elements.gameOver.style.display = 'none';
            gameState.dice = [1,1,1,1,1];
            gameState.held = [false,false,false,false,false];
            gameState.rollCount = 0;
            renderDice();
            updateControls();
        });

        // Назначаем обработчики
        elements.rollButton.addEventListener('click', rollDiceHandler);
        elements.endTurnButton.addEventListener('click', endTurn);
        
        // Первый рендер
        renderDice();
        updateControls();
        updateScoreboard();
    }

    initGame();
});