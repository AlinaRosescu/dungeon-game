const app = new PIXI.Application({width:850, height:500});
app.view.style.border= "5px solid black";

//add the canvas to the html document
document.body.appendChild(app.view);

let gameScene,player,state, healthBar;

//load and create sprite
PIXI.loader
    .add([
        "images/grid.png",
        "images/grid-border.png",
        "images/start-gate.png",
        "images/end-gate.png",
        "images/monster.png"])
    .load(setup);

function setup() {
    //make a new game scene and add it to stage
    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    //add dungoen floor texture
    let background = new PIXI.Sprite(
        PIXI.loader.resources["images/grid.png"].texture);
    background.scale.set(0.7,0.8);
    background.position.set(50,55);
    gameScene.addChild(background);

    //add dungeon walls
    let border = new PIXI.Sprite(
        PIXI.loader.resources["images/grid-border.png"].texture);
    border.position.set(-20, -65);
    border.scale.set(0.7,0.8);
    gameScene.addChild(border);

    //add start gate
    let startGate = new PIXI.Sprite(
        PIXI.loader.resources["images/start-gate.png"].texture);
    startGate.position.set(150,0);
    startGate.scale.set(0.7, 0.7);
    gameScene.addChild(startGate);

    //add end gate
    let endGate = new PIXI.Sprite(
        PIXI.loader.resources["images/end-gate.png"].texture);
    endGate.position.set(800,350);
    endGate.scale.set(0.7, 0.7);
    gameScene.addChild(endGate);

    //add chest
    let chestTexture = PIXI.Texture.fromImage("images/chest-tileset.png");
    let chestRectangle = new PIXI.Rectangle(0,0,30,30);
    chestTexture.frame = chestRectangle;

    let chest = new PIXI.Sprite(chestTexture);
    chest.position.set(650,280);
    chest.scale.set(1.5,1.5);
    gameScene.addChild(chest);

    //add monsters
    let numberOfMonsters = 7;
        spacing = 50;
        xOffset = 250;
        speed = 1;
        direction = 1;
        monsters = [];

    for(let i = 0; i < numberOfMonsters; i++) {
        let monster = new PIXI.Sprite(
            PIXI.loader.resources["images/monster.png"].texture);
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

    //add player
    let playerTexture = PIXI.Texture.fromImage("images/fox-tileset.png");
    let playerRectangle = new PIXI.Rectangle(0,15,50,65);
    playerTexture.frame = playerRectangle;
    player = new PIXI.Sprite(playerTexture);
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

    //add event listeners for keyboard controls
    document.addEventListener("keydown", keyboard);
    document.addEventListener("keyup", keyboard);

    //Set the game state
    state = play;

    //Start the game loop
    gameLoop();
}

//function to make player move at 60fps
function gameLoop() {
    requestAnimationFrame(gameLoop);
    state();
    app.stage.addChild(player);
}

function play() {
    //console.log(player.width);
    if(player.x + player.width === 805 || player.x - player.width === 10) {
        player.x += 1;
    }
    if(player.y + player.height === 490 || player.y - player.height === 10) {
       player.y +=1;
       healthBar.inner.width -= 1;
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
        monster.y += monster.vy;
        if(monster.y - monster.height === 5) {
           monster.vy = 1;
        }

        if(monster.y + monster.height === 460) {
            monster.vy = -1;
        }
    });



}

//random number function
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keyboard(key) {
    let pressedKey;
    if(key.code === "ArrowDown" || key.code === "KeyS") {
        if(key.type ===  "keydown") {
            pressedKey = "down";
            player.accelerationY = player.speed;
            player.frictionY = 1;
        } else if (key.type ===  "keyup" && pressedKey !== "up"){
            player.accelerationY = 0;
            player.frictionY = player.drag;
        }
    } else if(key.code === "ArrowUp" || key.code ==="KeyW"){
        if(key.type ===  "keydown") {
            pressedKey = "up";
            player.accelerationY = -player.speed;
            player.frictionY = 1;
        } else if (key.type ===  "keyup" && pressedKey !== "down"){
            player.accelerationY = 0;
            player.frictionY = player.drag;
        }
    } else if(key.code === "ArrowRight" || key.code ==="KeyD"){
        if(key.type ===  "keydown") {
            pressedKey = "right";
            player.accelerationX = player.speed;
            player.frictionX = 1;
        } else if (key.type ===  "keyup" && pressedKey !== "left"){
            player.accelerationX = 0;
            player.frictionX = player.drag;
        }
    } else if(key.code === "ArrowLeft" || key.code ==="KeyA"){
        if(key.type ===  "keydown") {
            pressedKey = "left";
            player.accelerationX = -player.speed;
            player.frictionX = 1;
        } else if (key.type ===  "keyup" && pressedKey !== "right"){
            player.accelerationX = 0;
            player.frictionX = player.drag;
        }
    }
}
