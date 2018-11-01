const app = new PIXI.Application({width:850, height:500});
    app.view.style.border= "5px solid black";

    //add the canvas to the html document
    document.body.appendChild(app.view);

    let player,state;

    //load and create sprite
    PIXI.loader
        .add([
            "images/grid.png",
            "images/grid-border.png",
            "images/gate.png",
            "images/end-gate.png",
            "images/monster.png"])
        .load(setup);

    function setup() {
        let background = new PIXI.Sprite(
            PIXI.loader.resources["images/grid.png"].texture);
        background.scale.set(0.7,0.8);
        background.position.set(50,55);

        let border = new PIXI.Sprite(
            PIXI.loader.resources["images/grid-border.png"].texture);
        border.position.set(-20, -65);
        border.scale.set(0.7,0.8);

        let gate = new PIXI.Sprite(
            PIXI.loader.resources["images/gate.png"].texture);
        gate.position.set(150,0);
        gate.scale.set(0.7, 0.7);

        let endGate = new PIXI.Sprite(
            PIXI.loader.resources["images/end-gate.png"].texture);
        endGate.position.set(800,350);
        endGate.scale.set(0.7, 0.7);

        //add chest
        let texture = PIXI.Texture.fromImage("images/chest-tileset.png");
        let rectangle = new PIXI.Rectangle(0,0,30,30);
        texture.frame = rectangle;
        let chest = new PIXI.Sprite(texture);
        chest.position.set(650,280);
        chest.scale.set(1.5,1.5);

        //add all sprites to the stage
        app.stage.addChild(background,border,gate,endGate,chest);

        //add monsters
        let numberOfMonsters = 7;
            spacing = 50;
            xOffset = 250;

        for(let i = 0; i < numberOfMonsters; i++) {
            let monster = new PIXI.Sprite(
                PIXI.loader.resources["images/monster.png"].texture);
            let x = spacing * i + xOffset;
            let y = randomInt(50, app.stage.height - monster.height- 200);
            monster.x = x;
            monster.y = y;
            monster.scale.set(1.5, 1.5);
            app.stage.addChild(monster);
        }

        //add player
        let texture2 = PIXI.Texture.fromImage("images/fox-tileset.png");
        let rectangle2 = new PIXI.Rectangle(0,15,50,65);
        texture2.frame = rectangle2;
        player = new PIXI.Sprite(texture2);
        player.scale.set(0.8,0.8);
        player.x = 150;
        player.y = 150;
        player.vx = 0;
        player.vy = 0;
        player.accelerationX = 0;
        player.accelerationY = 0;
        player.frictionX = 1;
        player.frictionY = 1;

        player.speed = 0.5;
        player.drag = 1;

        app.stage.addChild(player);

        //Capture the keyboard arrow keys
        let left = keyboard(37),
            up = keyboard(38),
            right = keyboard(39),
            down = keyboard(40);

        //Left arrow key `press` method
        left.press = () => {
            //Change the player's velocity when the key is pressed
            player.accelerationX = -player.speed;
            player.frictionX = 1;
        };

        //Left arrow key `release` method
        left.release = () => {
            //If the left arrow has been released, and the right arrow isn't down,
            //and the player isn't moving vertically:
            //Stop the player
            if (!right.isDown) {
                player.accelerationX = 0;
                player.frictionX = player.drag;
            }
        };
        //Up
        up.press = () => {
            player.accelerationY = -player.speed;
            player.frictionY = 1;
        };
        up.release = () => {
            if (!down.isDown) {
                player.accelerationY = 0;
                player.frictionY = player.drag;
            }
        };
        //Right
        right.press = () => {
            player.accelerationX = player.speed;
            player.frictionX = 1;
        };
        right.release = () => {
            if (!left.isDown) {
                player.accelerationX = 0;
                player.frictionX = player.drag;
            }
        };

        //Down
        down.press = () => {
            player.accelerationY = player.speed;
            player.frictionY = 1;
        };
        down.release = () => {
            if (!up.isDown) {
                player.accelerationY = 0;
                player.frictionY = player.drag;
            }
        };

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
        //adding acceleration and friction
        player.vx = player.accelerationX;
        player.vy = player.accelerationY;
        player.vx *= player.frictionX;
        player.vy *= player.frictionY;

        //changing velocity properties
        player.x += player.vx;
        player.y += player.vy;
    }

    //random number function
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }