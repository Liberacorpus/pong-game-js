const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

//Pobranie spanów z punktacją
const playerPointsTable = document.querySelector('.playerPoints');
const computerPointsTable = document.querySelector('.computerPoints');

//Pobranie przycisku do resetowania gry
const btnReset = document.querySelector('.reset');

//Pobranie przycisku do dodawnia piłki
const btnAddBall = document.querySelector('.addBall');


//Pobieranie przycisku do usuwania piłeczek
const btnRemoveBall = document.querySelector('.removeBall');


//Pobranie przyciusku multiplayer
const btnMultiplayer = document.querySelector('.multi');

//Wymiar planszy do gry
canvas.width = 1000;
canvas.height = 500;

//Wymiary pojedynczej linii dzielącej boisko
const lineWidth = 4;
const lineHeight = 16;

//Zmienne przechowujące punkty z gry
let playerPoints = 0;
let computerPoints = 0;

//Zdefiniowanie zmiennej z aktualną szerokością canvas, która będzie zmieniana  zalezności od poziomu gry;
let gameWidth = canvas.width;
//Zmienna prędkości poruszania się piłeczki
const startSpeed = 5;
//Zmienna dla włączania lub wyłączania trybu multiplayer
let multiplayer = false;
//Zmienna dla zmiany prędkości piłeczki
let difficult = 0.5;

//Funkcja dodawania piłeczki na klik przycisku
btnRemoveBall.addEventListener('click', () => {
    if (collisionObjects.length > 3) collisionObjects.pop();
    if (ballsGame.length > 1) ballsGame.pop();
});

//Funkcja usuwania piłeczki na klik przycisku
btnAddBall.addEventListener('click', () => {
    const tempBall = new Ball(20, 'red', canvas.width / 2 - 4, canvas.height / 2 - 4);
    collisionObjects.push(tempBall);
    ballsGame.push(tempBall);
});

//Funkcja aktualizująca punkt z gry
const updateScores = () => {
    playerPointsTable.textContent = playerPoints;
    computerPointsTable.textContent = computerPoints;
}
//Funkcja resetująca grę na przycisku
const resetGame = () => {
    clearInterval(timer); //trzeba to zrobić żeby zniwelować nakładanie się prędkości piłeczki po resecie;
    playerPoints = computerPoints = 0;
    ballsGame.forEach(ballsGame => {
        ballsGame.resetBall();
    });
    timer = setInterval(run, 1000 / 60);
}

//Funkcja obsługująca sterowanie paletką za pomocą klawiatury
const keyboardSupport = event => {
    // console.log(event.keyCode);
    if (event.keyCode == 87) {
        playerPaddle.moveUp(collisionObjects);
    } else if (event.keyCode == 83) {
        playerPaddle.moveDown(collisionObjects);
    }
    if (multiplayer) {
        if (event.keyCode == 38) {
            computerPaddle.moveUp(collisionObjects);
        } else if (event.keyCode == 40) {
            computerPaddle.moveDown(collisionObjects);
        }
    }
}

//Funkcja wywołująca ruchy piłek;
const ballMove = ballsGame => {
    ballsGame.forEach(ballGame => {
        ballGame.move(collisionObjects); //metoda move() przyjmuje jako argument tablicę collisionObjects, która zawiera wszystkie obiekty kolizyjne (planszę do gry, piłeczki i rakietki)
        // console.log(collision);
    })
    // console.log("działa");
}

//Funkcja do zmiany szerokości pola gry
const updateGameWindow = () => {
    gameWidth = canvas.width;
    computerPaddle.positionX = canvas.width - 30;
}

//Funkcja do rysowania nowej planszy do gry, która będzie ukrywała pozycję starych elementów, żeby wywołać animację ruchu rakietek i piłki;
const clearScreen = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function Paddle(width, height, color, positionX, positionY) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.positionX = positionX;
    this.positionY = positionY;
    this.speed = 3;
    this.middleHeight = height / 2;

    //Metoda na ruch rakietki przez PC
    this.autoMove = ballsGame => {
        let minX = canvas.width;
        let numberOfMinElements;
        let tempX;
        //Sprawdzanie minimalnej pozycji piłeczki od rakietki
        for (let i = 0; i < ballsGame.length; i++) {
            if (this.positionX < ballsGame[i].positionX) {
                tempX = this.positionX - ballsGame[i].positionX;
            } else {
                tempX = ballsGame[i].positionX - this.positionX;
            }
            if (minX > tempX) {
                minX = tempX;
                numberOfMinElements = i;
            }
        }
        if (this.positionY + this.middleHeight > ballsGame[numberOfMinElements].positionY - ballsGame[numberOfMinElements].middleHeight) {
            this.moveUp(ballsGame);
        } else {
            this.moveDown(ballsGame);
        }
    }

    //Metody na ruch paletki w górę i w dół oraz kolizję z piłeczką (górną i dolną krawędzią) oraz górną i dolną krawędzią planszy
    this.moveUp = ballsGame => {
        const paddleTop = this.positionY;
        const paddleLeft = this.positionX;
        const paddleRight = this.positionX + this.width;
        let ballBottom;
        let ballLeft;
        let ballRight;
        let collision = false;
        for (let i = 0; i < ballsGame.length; i++) {
            ballBottom = ballsGame[i].positionY + ballsGame[i].height;
            ballLeft = ballsGame[i].positionX;
            ballRight = ballsGame[i].positionX + ballsGame[i].width;

            if (((paddleLeft <= ballLeft && ballLeft <= paddleRight) || (paddleLeft <= ballRight && ballRight <= paddleRight)) && (paddleTop >= ballBottom && (paddleTop - this.speed <= ballBottom))) {
                this.positionY = ballBottom;
                collision = !collision;
                break;
            } else if (paddleTop - this.speed < 0) {
                this.positionY = 0;
                collision = !collision;
                break;
            }
            if (!collision) this.positionY -= this.speed;
        }
    }
    this.moveDown = ballsGame => {
        const paddleBottom = this.positionY + this.height;
        const paddleLeft = this.positionX;
        const paddleRight = this.positionX + this.width;
        let ballTop;
        let ballLeft;
        let ballRight;
        let collision = false;
        for (let i = 0; i < ballsGame.length; i++) {
            ballTop = ballsGame[i].positionY;
            ballLeft = ballsGame[i].positionX;
            ballRight = ballsGame[i].positionX + ballsGame[i].width;

            if (((paddleLeft <= ballLeft && ballLeft <= paddleRight) || (paddleLeft <= ballRight && ballRight <= paddleRight)) && (paddleBottom <= ballTop && (paddleBottom + this.speed >= ballTop))) {
                this.positionY = ballTop - this.height;
                collision = !collision;
                break;
            } else if (paddleBottom + this.speed > canvas.height) {
                this.positionY = canvas.height - this.height;
                collision = !collision;
                break;
            }
            if (!collision) this.positionY += this.speed;
        }
    }
}

function Ball(size, color, positionX, positionY) {
    this.width = size;
    this.height = size;
    this.color = color;
    this.positionX = positionX;
    this.positionY = positionY;
    this.middleHeight = size / 2;
    this.speedX = startSpeed;
    this.speedY = startSpeed;
    this.directionX = true; //true --> w prawo
    this.directionY = true; //true --> w dół

    //Metoda resetowania piłeczki
    this.resetBall = () => {
        if (Math.round(Math.random())) {
            this.directionX = !this.directionX;
        }
        if (Math.round(Math.random())) {
            this.directionY = !this.directionY;
        }
        this.speedX = startSpeed;
        this.speedY = startSpeed;
        this.positionX = canvas.width / 2 - this.width / 2;
        this.positionY = canvas.height / 2 - this.height / 2;
    }

    //Metoda na ruch i odbijanie piłeczki
    this.move = collisionObjects => {
        let collision = 0;
        const ballLeft = this.positionX; //lewa ścianka piłeczki
        const ballRight = this.positionX + this.width; //prawa ścianka piłeczki
        const ballTop = this.positionY; //górna ścianka piłeczki
        const ballBottom = this.positionY + this.height; // dolna ścianka piłeczki

        //I warunek - piłka porusza się do prawego dolnego rogu
        if (this.directionX && this.directionY) {
            for (let i = 0; i < collisionObjects.length; i++) {
                let objectLeft = collisionObjects[i].positionX;
                let objectRight = collisionObjects[i].positionX + collisionObjects[i].width;
                let objectTop = collisionObjects[i].positionY;
                let objectBottom = collisionObjects[i].positionY + collisionObjects[i].height;
                //Sprawdzenie czy nasza piłeczka jest obiektem kolizyjnym --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                if (this === collisionObjects[i]) continue;
                //Sprawdzanie czy ścianka piłeczki znajduje się pomiędzy lewą a prawą ścianką paletki lub górną i dolną ścianką paletki --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                else if (((objectLeft <= ballLeft && ballLeft <= objectRight) || (objectLeft <= ballRight && ballRight <= objectRight)) && ((objectTop <= ballTop && ballTop <= objectBottom) || (objectTop <= ballBottom && ballBottom <= objectBottom))) {
                    this.directionX != this.directionX;
                    break;
                }
                //Intrukcja do wykrywania kolizji
                if ((ballLeft < objectRight && ((objectLeft <= ballLeft + this.speedX && ballLeft + this.speedX <= objectRight) || (objectLeft <= ballRight + this.speedX && ballRight + this.speedX <= objectRight))) && (ballTop < objectBottom && ((objectTop <= ballTop + this.speedY && ballTop + this.speedY <= objectBottom) || (objectTop <= ballBottom + this.speedY && ballBottom + this.speedY <= objectBottom)))) {
                    collision = 1;
                    break;
                } else if (ballBottom + this.speedY > canvas.height) {
                    collision = 2;
                    break;
                } else if (ballRight + this.speedX > canvas.width) {
                    collision = 3;
                    playerPoints++;
                    break;
                }
            }
        }
        //II warunek - piłka porusza się do prawego górnego rogu
        else if (this.directionX && !this.directionY) {
            for (let i = 0; i < collisionObjects.length; i++) {
                let objectLeft = collisionObjects[i].positionX;
                let objectRight = collisionObjects[i].positionX + collisionObjects[i].width;
                let objectTop = collisionObjects[i].positionY;
                let objectBottom = collisionObjects[i].positionY + collisionObjects[i].height;
                //Sprawdzenie czy nasza piłeczka jest obiektem kolizyjnym --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                if (this === collisionObjects[i]) continue;
                //Sprawdzanie czy ścianka piłeczki znajduje się pomiędzy lewą a prawą ścianką paletki lub górną i dolną ścianką paletki --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                else if (((objectLeft <= ballLeft && ballLeft <= objectRight) || (objectLeft <= ballRight && ballRight <= objectRight)) && ((objectTop <= ballTop && ballTop <= objectBottom) || (objectTop <= ballBottom && ballBottom <= objectBottom))) {
                    this.directionX != this.directionX;
                    break;
                }
                //Intrukcja do wykrywania kolizji
                if ((ballLeft < objectRight && ((objectLeft <= ballLeft + this.speedX && ballLeft + this.speedX <= objectRight) || (objectLeft <= ballRight + this.speedX && ballRight + this.speedX <= objectRight))) && (ballBottom > objectTop && ((objectTop <= ballTop - this.speedY && ballTop - this.speedY <= objectBottom) || (objectTop <= ballBottom - this.speedY && ballBottom - this.speedY <= objectBottom)))) {
                    collision = 1;
                    break;
                } else if (ballTop - this.speedY < 0) {
                    collision = 2;
                    break;
                } else if (ballRight + this.speedX > canvas.width) {
                    collision = 3;
                    playerPoints++;
                    break;
                }
            }
        }
        //III warunek - piłka porusza się do lewego dolnego rogu
        else if (!this.directionX && this.directionY) {
            for (let i = 0; i < collisionObjects.length; i++) {
                let objectLeft = collisionObjects[i].positionX;
                let objectRight = collisionObjects[i].positionX + collisionObjects[i].width;
                let objectTop = collisionObjects[i].positionY;
                let objectBottom = collisionObjects[i].positionY + collisionObjects[i].height;
                //Sprawdzenie czy nasza piłeczka jest obiektem kolizyjnym --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                if (this === collisionObjects[i]) continue;
                //Sprawdzanie czy ścianka piłeczki znajduje się pomiędzy lewą a prawą ścianką paletki lub górną i dolną ścianką paletki --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                else if (((objectLeft <= ballLeft && ballLeft <= objectRight) || (objectLeft <= ballRight && ballRight <= objectRight)) && ((objectTop <= ballTop && ballTop <= objectBottom) || (objectTop <= ballBottom && ballBottom <= objectBottom))) {
                    this.directionX != this.directionX;
                    break;
                }
                //Intrukcja do wykrywania kolizji
                if ((ballRight > objectLeft && ((objectLeft <= ballLeft - this.speedX && ballLeft - this.speedX <= objectRight) || (objectLeft <= ballRight - this.speedX && ballRight - this.speedX <= objectRight))) && (ballTop < objectBottom && ((objectTop <= ballTop + this.speedY && ballTop + this.speedY <= objectBottom) || (objectTop <= ballBottom + this.speedY && ballBottom + this.speedY <= objectBottom)))) {
                    collision = 1;
                    break;
                } else if (ballBottom + this.speedY > canvas.height) {
                    collision = 2;
                    break;
                } else if (ballLeft - this.speedX < 0) {
                    collision = 3;
                    computerPoints++;
                    break;
                }
            }
        }
        //IV warunek - piłka porusza się do lewego górnego rogu
        else {
            for (let i = 0; i < collisionObjects.length; i++) {
                let objectLeft = collisionObjects[i].positionX;
                let objectRight = collisionObjects[i].positionX + collisionObjects[i].width;
                let objectTop = collisionObjects[i].positionY;
                let objectBottom = collisionObjects[i].positionY + collisionObjects[i].height;
                //Sprawdzenie czy nasza piłeczka jest obiektem kolizyjnym --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                if (this === collisionObjects[i]) continue;
                //Sprawdzanie czy ścianka piłeczki znajduje się pomiędzy lewą a prawą ścianką paletki lub górną i dolną ścianką paletki --> NIE SPRAWDZA W TYM WYPADKU KOLIZJI
                else if (((objectLeft <= ballLeft && ballLeft <= objectRight) || (objectLeft <= ballRight && ballRight <= objectRight)) && ((objectTop <= ballTop && ballTop <= objectBottom) || (objectTop <= ballBottom && ballBottom <= objectBottom))) {
                    this.directionX != this.directionX;
                    break;
                }
                //Intrukcja do wykrywania kolizji
                if ((ballRight > objectLeft && ((objectLeft <= ballLeft - this.speedX && ballLeft - this.speedX <= objectRight) || (objectLeft <= ballRight - this.speedX && ballRight - this.speedX <= objectRight))) && (ballBottom > objectTop && ((objectTop <= ballTop - this.speedY && ballTop - this.speedY <= objectBottom) || (objectTop <= ballBottom - this.speedY && ballBottom - this.speedY <= objectBottom)))) {
                    collision = 1;
                    break;
                } else if (ballTop - this.speedY < 0) {
                    collision = 2;
                    break;
                } else if (ballLeft - this.speedX < 0) {
                    collision = 3;
                    computerPoints++;
                    break;
                }
            }
        }
        // console.log(collision);
        //Sprawdzenie czy nastąpiła kolizja i wyknanie odbicia
        if (collision) {
            //Instrukcja warunkowa do wywołania losowego przyspieszenia po kolizji
            if (Math.round(Math.random())) {  //Math.round() zaokroglą wylosowwaną liczbę do 0 lub 1
                this.speedX += difficult + (Math.round(Math.random()) / 10);
            } else {
                this.speedY += difficult + (Math.round(Math.random()) / 10);
            }
            if (collision == 1) {
                this.directionX = !this.directionX;
                if (Math.round(Math.random())) {
                    this.directionY = !this.directionY;
                }
            } else if (collision == 2) {
                this.directionY = !this.directionY;
            } else {
                this.resetBall(); //Metoda, która po zdobyciu lub utracie punktu (piłeczka uderza w bok canvas) będzie resetowała piłeczkę
            }
        }
        //Nadanie ruchu piłeczki!
        else {
            if (this.directionX) {
                this.positionX += this.speedX;
            } else {
                this.positionX -= this.speedX;
            }
            if (this.directionY) {
                this.positionY += this.speedY;
            } else {
                this.positionY -= this.speedY;
            }
        }
        // console.log(collision);
    }
}

//Tablica do której będą dodawane wszystkie obiekty, z którymi będzie następowała kolizja, czyli piłki i rakietki
const collisionObjects = [];

//Tablica, która będzie zawierała wszystkie piłeczki naszej gry;
const ballsGame = [];


//Funkcja do narysowania elementów gry;
const drawObject = (collisionObjects, context) => {
    collisionObjects.forEach(collisionObject => {
        context.fillStyle = collisionObject.color;
        context.fillRect(collisionObject.positionX, collisionObject.positionY, collisionObject.width, collisionObject.height);
    })
}

//Tworzenie obiektów na planszy do gry
const playerPaddle = new Paddle(20, 120, 'green', 10, 50);
const computerPaddle = new Paddle(20, 120, 'red', canvas.width - 30, 100);
const ballOne = new Ball(20, 'white', canvas.width / 2 - 4, canvas.height / 2 - 4);

//Wprowadzanie instancji obiektów do tablicy
collisionObjects.push(playerPaddle, computerPaddle, ballOne);
ballsGame.push(ballOne);

//Wywołanie funkcji rysowania obiektów

const run = () => {
    if (gameWidth !== canvas.width) {
        updateGameWindow(); //Funkcja jest uruchamiana jeżeli zmienna przechowująca aktualną szerokość pola gry jest różna od pola gry definiowanego przez szerokość canvas;
    }
    clearScreen();
    ballMove(ballsGame);
    if (!multiplayer) {
        computerPaddle.autoMove(ballsGame);
    }
    updateScores();
    drawObject(collisionObjects, ctx);
    if (playerPoints == 10 || computerPoints == 10) {
        clearInterval(timer);
    }
    for (let linePosition = 20; linePosition < canvas.height; linePosition += 30) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(canvas.width / 2 - lineWidth / 2, linePosition, lineWidth, lineHeight);
    }
}
btnReset.addEventListener('click', resetGame);
window.addEventListener('keydown', keyboardSupport);
btnMultiplayer.addEventListener('click', () => multiplayer = !multiplayer);
let timer = setInterval(run, 1000 / 60);