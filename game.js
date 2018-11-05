const app = new PIXI.Application({width:850, height:500});
app.view.style.border= "5px solid black";

//add the canvas to the html document
document.body.appendChild(app.view);

let gameScene,gameOverScene,player,monster,state,healthBar,endGate,chest,message;
let monsters = [];

//load and create sprite
PIXI.loader
    .add("images/dungeonSheet.json")
    .load(setup);

function setup() {
    let spriteSheet = PIXI.loader.resources["images/dungeonSheet.json"].textures;

    //make a new game scene and add it to stage
    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    //add dungoen floor texture
    let background = new PIXI.Sprite(spriteSheet["grid.png"]);
    background.scale.set(0.7,0.8);
    background.position.set(50,55);
    gameScene.addChild(background);

    //add dungeon walls
    let border = new PIXI.Sprite(spriteSheet["grid-border.png"]);
    border.position.set(-20, -65);
    border.scale.set(0.7,0.8);
    gameScene.addChild(border);

    //add start gate
    let startGate = new PIXI.Sprite(spriteSheet["start-gate.png"]);
    startGate.position.set(150,0);
    startGate.scale.set(0.7, 0.7);
    gameScene.addChild(startGate);

    //add end gate
    endGate = new PIXI.Sprite(spriteSheet["end-gate.png"]);
    endGate.position.set(800,350);
    endGate.scale.set(0.7, 0.7);
    gameScene.addChild(endGate);

    //add player
    player = new PIXI.Sprite(spriteSheet["fox.png"]);
    player.scale.set(0.8,0.8);
    player.x = 150;
    player.y = 150;
    player.vx = 0;
    player.vy = 0;
    player.accelerationX = 0;
    player.accelerationY = 0;
    player.frictionX = 1;
    player.frictionY = 1;
    player.speed = 1;
    player.drag = 1.5;
    gameScene.addChild(player);

    //add chest
    chest = new PIXI.Sprite(spriteSheet["chest.png"]);
    chest.x = 655;
    chest.y = 255;
    gameScene.addChild(chest);

    //add monsters
    let numberOfMonsters = 7;
    let spacing = 90;
    let xOffset = 200;
    let speed = 3;
    let direction = 1;

    for(let i = 0; i < numberOfMonsters; i++) {
        monster = new PIXI.Sprite(spriteSheet["monster.png"]);
        let x = spacing * i + xOffset;
        let y = randomInt(50, app.stage.height - monster.height- 200);
        monster.x = x;
        monster.y = y;
        monster.scale.set(1.5, 1.5);
        monster.vy = speed * direction;
        direction *= -1;

        monsters.push(monster);
        gameScene.addChild(monster);
    }

    //create health bar
    healthBar = new PIXI.Container();
    healthBar.position.set(app.stage.width - 210, 10);
    gameScene.addChild(healthBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0x000000);
    outerBar.drawRect(0,0,120,20);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0xFF3300);
    innerBar.drawRect(5,5,110,10);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    healthBar.inner = innerBar;

    //create scene to show for when the game is over
    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    //create message to let player know of the game outcome
    let style = new PIXI.TextStyle({fontFamily: "Futura", fontSize: 60, fill: "white"});
    message = new PIXI.Text("The end!", style);
    message.x = app.view.width / 2 - message.width / 2;
    message.y = app.view.height / 2 - message.height / 2;
    gameOverScene.addChild(message);

    //add event listeners for keyboard controls
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    //Set the game state
    state = play;

    //Start the game loop
    app.ticker.add(delta => gameLoop(delta));
}

//function to make the game loop
function gameLoop(delta) {
    state(delta);
}

function play() {
    let playerBounds = player.getBounds();
    player.alpha = 1;
    if(player.x + player.width >= 805) {
        player.x -= 1;
    } else if(player.x - player.width <= 10) {
        player.x += 1;
    }
    if (player.y + player.height >= 450) {
       player.y -=1;
    } else if(player.y - player.height <= 10) {
        player.y +=1;
    }

    //adding acceleration and friction
    player.vx = player.accelerationX;
    player.vy = player.accelerationY;
    player.vx *= player.frictionX;
    player.vy *= player.frictionY;

    //changing velocity properties
    player.x += player.vx;
    player.y += player.vy;

    //move the monsters
    monsters.forEach((monster) => {
        let monsterBounds = monster.getBounds();
        monster.y += monster.vy;

        //check if monsters are hitting the top or bottom wall and contain them
        if(monster.y - monster.height <= 5 || monster.y + monster.height >= 460) {
           monster.vy *= -1;
        }

        //check collision between moster and player
        if(collisionIsDetected(playerBounds,monsterBounds)) {
            healthBar.inner.width -= 1;
            player.alpha = 0.5;
        }
    })


    if(healthBar.inner.width < 0) {
        state = end;
        message.text = "You lost!";
    }

    let chestBounds = chest.getBounds();

    //check player and chest collision and if true player picks up chest
    if(collisionIsDetected(playerBounds, chestBounds)) {
        chest.x = player.x + 10;
        chest.y = player.y + 30;
    }

    //check player has reached end gate and if true game is won
    let endGateBounds = endGate.getBounds();
    if (collisionIsDetected(chestBounds, endGateBounds)) {
        state = end;
        message.text = "You won!";
    }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}

//random number function
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//function for keydown event
function onKeyDown(key) {
    if(key.code === "ArrowDown") {
        player.accelerationY = player.speed;
        player.frictionY = 1;
    } else if(key.code === "ArrowUp"){
        player.accelerationY = -player.speed;
        player.frictionY = 1;
    } else if(key.code === "ArrowRight"){
        player.accelerationX = player.speed;
        player.frictionX = 1;
    } else if(key.code === "ArrowLeft"){
        player.accelerationX = -player.speed;
        player.frictionX = 1;
    }
    return key.code;
}

//function for keyup event
function onKeyUp(key) {
    if(key.code === "ArrowDown" && onKeyDown !== "ArrowUp") {
        player.accelerationY = 0;
        player.frictionY = player.drag;
    } else if(key.code === "ArrowUp" && onKeyDown !== "ArrowDown"){
        player.accelerationY = 0;
        player.frictionY = player.drag;
    } else if(key.code === "ArrowRight" && onKeyDown !== "ArrowLeft"){
        player.accelerationX = 0;
        player.frictionX = player.drag;
    } else if(key.code === "ArrowLeft" && onKeyDown !== "ArrowRight"){
        player.accelerationX = 0;
        player.frictionX = player.drag;
    }
}

//detect collision between player and monsters
function collisionIsDetected(a,b) {
    return (a.x + a.width > b.x) &&
        (a.x < b.x + b.width) &&
        (a.y + a.height > b.y) &&
        (a.y < b.y + b.height);
}