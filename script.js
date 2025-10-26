class ScientificCalculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;

        this.initializeElements();
        this.setupEventListeners();
        this.setupAudio();
        this.updateDisplay();
    }

    initializeElements() {
        this.previousOperandElement = document.getElementById('previousOperand');
        this.currentOperandElement = document.getElementById('currentOperand');
        this.clickSound = document.getElementById('clickSound');
    }

    setupAudio() {
        // Create click sound programmatically
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.playClickSound = () => {
            try {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                console.log('Audio not supported');
            }
        };
    }

    playSound() {
        this.playClickSound();
    }

    addButtonPressEffect(button) {
        button.classList.add('button-press');
        setTimeout(() => {
            button.classList.remove('button-press');
        }, 100);
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;

        if (this.previousOperand !== '') {
            this.calculate();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero!');
                    return;
                }
                computation = prev / current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }

        this.currentOperand = this.formatResult(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    percentage() {
        this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
    }

    performScientificFunction(func) {
        const current = parseFloat(this.currentOperand);

        if (isNaN(current) && !['π', 'e', '(', ')'].includes(func)) {
            return;
        }

        let result;

        switch (func) {
            case 'sin':
                result = Math.sin(current * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(current * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(current * Math.PI / 180);
                break;
            case 'sinh':
                result = Math.sinh(current);
                break;
            case 'cosh':
                result = Math.cosh(current);
                break;
            case 'tanh':
                result = Math.tanh(current);
                break;
            case 'log':
                if (current <= 0) {
                    this.showError('Logarithm undefined for non-positive numbers');
                    return;
                }
                result = Math.log10(current);
                break;
            case 'ln':
                if (current <= 0) {
                    this.showError('Natural log undefined for non-positive numbers');
                    return;
                }
                result = Math.log(current);
                break;
            case '√':
                if (current < 0) {
                    this.showError('Square root undefined for negative numbers');
                    return;
                }
                result = Math.sqrt(current);
                break;
            case 'x²':
                result = Math.pow(current, 2);
                break;
            case 'x^y':
                this.operation = '^';
                this.previousOperand = this.currentOperand;
                this.currentOperand = '';
                this.updateDisplay();
                return;
            case '10^x':
                result = Math.pow(10, current);
                break;
            case 'exp':
                result = Math.exp(current);
                break;
            case '1/x':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = 1 / current;
                break;
            case '|x|':
                result = Math.abs(current);
                break;
            case '!':
                if (current < 0 || !Number.isInteger(current)) {
                    this.showError('Factorial only for non-negative integers');
                    return;
                }
                result = this.factorial(current);
                break;
            case 'π':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case '(':
                this.appendNumber('(');
                this.updateDisplay();
                return;
            case ')':
                this.appendNumber(')');
                this.updateDisplay();
                return;
            default:
                return;
        }

        this.currentOperand = this.formatResult(result);
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    formatResult(number) {
        if (typeof number !== 'number' || isNaN(number)) return '0';

        // Handle very large or very small numbers
        if (Math.abs(number) > 1e15 || (Math.abs(number) < 1e-6 && number !== 0)) {
            return number.toExponential(6);
        }

        // Format regular numbers
        const stringNumber = number.toString();
        if (stringNumber.includes('.')) {
            const [integer, decimal] = stringNumber.split('.');
            if (decimal.length > 8) {
                return number.toFixed(8);
            }
        }

        return stringNumber;
    }

    showError(message) {
        this.currentOperand = 'Error';
        this.shouldResetScreen = true;
        this.updateDisplay();

        setTimeout(() => {
            this.clear();
            this.updateDisplay();
        }, 2000);
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.currentOperand;

        if (this.operation != null) {
            this.previousOperandElement.textContent =
                `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('.btn-number').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.getAttribute('data-number'));
                this.updateDisplay();
                this.playSound();
                this.addButtonPressEffect(button);
            });
        });

        // Operator buttons
        document.querySelectorAll('.btn-operator').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.getAttribute('data-operator'));
                this.updateDisplay();
                this.playSound();
                this.addButtonPressEffect(button);
            });
        });

        // Function buttons
        document.querySelectorAll('.btn-function').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');

                if (action === 'clear') {
                    this.clear();
                } else if (action === 'backspace') {
                    this.delete();
                } else if (action === 'percentage') {
                    this.percentage();
                }
                this.updateDisplay();
                this.playSound();
                this.addButtonPressEffect(button);
            });
        });

        // Scientific buttons
        document.querySelectorAll('.btn-scientific').forEach(button => {
            button.addEventListener('click', () => {
                this.performScientificFunction(button.getAttribute('data-scientific'));
                this.playSound();
                this.addButtonPressEffect(button);
            });
        });

        // Equals button
        document.querySelector('.btn-equals').addEventListener('click', () => {
            this.calculate();
            this.updateDisplay();
            this.playSound();
            this.addButtonPressEffect(document.querySelector('.btn-equals'));
        });

        // Keyboard support
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });
    }

    handleKeyboardInput(event) {
        if (event.key >= '0' && event.key <= '9') {
            this.appendNumber(event.key);
            this.playSound();
        } else if (event.key === '.') {
            this.appendNumber('.');
            this.playSound();
        } else if (['+', '-', '*', '/'].includes(event.key)) {
            let operator;
            switch (event.key) {
                case '+': operator = '+'; break;
                case '-': operator = '-'; break;
                case '*': operator = '×'; break;
                case '/': operator = '÷'; break;
            }
            this.chooseOperation(operator);
            this.playSound();
        } else if (event.key === 'Enter' || event.key === '=') {
            event.preventDefault();
            this.calculate();
            this.playSound();
        } else if (event.key === 'Escape' || event.key === 'Delete') {
            this.clear();
            this.playSound();
        } else if (event.key === 'Backspace') {
            this.delete();
            this.playSound();
        } else if (event.key === '%') {
            this.percentage();
            this.playSound();
        } else if (event.key === '(' || event.key === ')') {
            this.appendNumber(event.key);
            this.playSound();
        }

        this.updateDisplay();
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScientificCalculator();
});