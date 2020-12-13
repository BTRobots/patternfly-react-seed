import { Application, Sprite, Container } from 'pixi.js';
import { Events, Common, Composite, Body } from 'matter-js';
import { RobotVM } from '../../core/RobotVM';

// example taken from https://github.com/jaloplo/pixi.matterjs/edit/master/src/Matter.Pixi.Render.js


const Render = {};


let _requestAnimationFrame,
    _cancelAnimationFrame;

if (typeof window !== 'undefined') {
    _requestAnimationFrame = window.requestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.msRequestAnimationFrame 
      || function(callback){ window.setTimeout(function() { callback(Common.now()); }, 1000 / 60); };

    _cancelAnimationFrame = window.cancelAnimationFrame
      || window.mozCancelAnimationFrame 
      || window.webkitCancelAnimationFrame
      || window.msCancelAnimationFrame;
}
/*
Render.assets = function(resource) {
    return new Promise(function(resolve, reject) {
        Loader.add(resource).load(function(res) {
            resolve(res);
        });
    });
}
*/

Render.addChildren = function(render, sprite) {
    render.app.stage.addChild(sprite);
};


Render.create = function(options) {
    var defaults = {
        app: null,
        canvas: null,
        target: null,
        sprites: {},
    };

    var render = Common.extend(defaults, options);

    render.app = new Application(render);
    render.canvas = render.app.view;
    // we already have a canvas
    //(render.target || document.body).appendChild(render.canvas);

    return render;
};

// creates a Tank composite
Render.tank = function(render, body) {
    //var resource = body.render.sprite.resource;


    var texture = body.render.sprite.texture;

    let sprite: Sprite;

    const container = new Container();

    //if(resource) {
    if(texture) {
      sprite = new Sprite(render.spritesheet.textures[texture]);
    } else {
      sprite = new Sprite(render.spritesheet.texture);
    }
    
    // sprite.anchor.set(0.5);
    sprite.x = body.position.x;
    sprite.y = body.position.y;
    sprite.scale?.set(.2, .2);
    sprite.rotation = body.angle;
    body.width = sprite.width;
    body.height = sprite.height;

    render.sprites[body.id] = sprite;

    container.addChild(sprite);
    /*
    const turret = new Sprite(render.spritesheet.textures['Weapon_Color_A_256X256/Gun_01.png'])
    turret.anchor.set(.5)
    turret.x = sprite.x// + (sprite.width / 2);
    turret.y = sprite.y// + (sprite.height * 2 / 3);

    turret.scale.set(.2, .2);
    turret.rotation = body.angle;

    container.addChild(turret);
    */
    
    render.app.stage.addChild(container);
    //}

    return container;
}

Render.sprite = function(render, body) {
    //var resource = body.render.sprite.resource;
    var texture = body.render.sprite.texture;

    var sprite: Partial<Sprite> = {};

    //if(resource) {
    if(texture) {
      sprite = new Sprite(render.spritesheet.textures[texture]);
    } else {
      sprite = new Sprite(render.spritesheet.texture);
    }
    
    // sprite.anchor.set(0.5);
    sprite.x = body.position.x;
    sprite.y = body.position.y;
    sprite.scale?.set(.2, .2);
    sprite.rotation = body.angle;
    body.width = sprite.width;
    body.height = sprite.height;

    render.sprites[body.id] = sprite;

    render.app.stage.addChild(sprite);
    //}

    return sprite;
};


Render.remove = function(render, body) {
    render.app.stage.removeChild(render.sprites[body.id]);
    delete render.sprites[body.id];
}

/*
  MAIN LOOP
*/
Render.run = (render, engine, robotVMs: RobotVM[], robotTickCallback, tickCounter) => {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];

        if(body.render && body.render.sprite) {
            Render.sprite(render, body);
            // Render.tank(render, body);
        }
    }
    let cycle = 0;

    Events.on(engine, 'tick', () => {
      tickCounter(++cycle);
      var bodies = Composite.allBodies(engine.world);
      for (var i = 0; i < robotVMs.length; i++) {
        const {
            currentHeat,
            currentLife,
            desiredHeading,
            desiredSpeed,
            desiredTurrentRotation,
            fireMissile,
            layMine,
        } = robotVMs[i].tick()
        const turnStep = parseFloat((Math.PI / 1200).toPrecision(3));
        bodies.forEach(body => {
            if (body.label === `tank_${i}`) {
                if (typeof desiredHeading !== 'undefined' && parseFloat(desiredHeading.toPrecision(3)) !== parseFloat(body.angle.toPrecision(3))) {
                    
                    if (Math.abs(body.angle - desiredHeading) < turnStep) {
                        body.angle = desiredHeading;
                    } else {
                        // turn towards desired heading
                        body.angle = desiredHeading - body.angle > 0
                            ? body.angle + turnStep
                            : body.angle - turnStep
                    }
                }
                if (typeof desiredSpeed !== 'undefined' && desiredSpeed !== 0) {
                    /*Body.setPosition(body, {
                        x: body.position.x + Math.sin(body.angle) * (desiredSpeed / 100),
                        y: body.position.y + Math.cos(body.angle) * (desiredSpeed / 100),
                    })*/
                    Body.applyForce(body, body.position, {
                        x: Math.sin(body.angle) * (desiredSpeed) * 5,
                        y: -Math.cos(body.angle) * (desiredSpeed) * 5,
                    })
                }
            }
            if (body.label === `turret_${i}`) {
                if (typeof desiredTurrentRotation !== 'undefined') {
                    body.angle = desiredTurrentRotation;
                }
            }
        })
      }
    });


    // update visuals from physics engine
    Events.on(engine, 'beforeUpdate', function() {
        var bodies = Composite.allBodies(engine.world);
        for(var i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            var pixi = null || render.sprites[body.id];
            if(pixi) {
                pixi.x = body.position.x;
                pixi.y = body.position.y;
                pixi.rotation = body.angle;
            }
        }
    });
    
    (function loop(time){
        render.frameRequestId = _requestAnimationFrame(loop);
        render.app.renderer.render(render.app.stage);
    })();

    return render;
}

Render.stop = function(render) {
    _cancelAnimationFrame(render.frameRequestId);
    render.app.stop();
    render.canvas.remove();
    render.canvas = null;
    render.context = null;
    render.textures = {};
};

export { Render };
