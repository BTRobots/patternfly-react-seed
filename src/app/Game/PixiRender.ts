import { Application, Sprite, ObservablePoint } from 'pixi.js';
import { Events, Common, Composite } from 'matter-js';
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


Render.tank = function(render, body) {
    //var resource = body.render.sprite.resource;
    var texture = body.render.sprite.texture;

    var sprite: Partial<Sprite> = {};

    //if(resource) {
    if(texture) {
      sprite = new Sprite(render.spritesheet.textures[texture]);
    } else {
      sprite = new Sprite(render.spritesheet.texture);
    }
    
    sprite.anchor.set(0.5);
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
    
    sprite.anchor.set(0.5);
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
Render.run = (render, engine, robotVMs: RobotVM[]) => {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        if(body.render && body.render.sprite) {
            Render.sprite(render, body);
        }
    }

    Events.on(engine, 'tick', () => {
      for (var i = 0; i < robotVMs.length; i++) {
        robotVMs[i].tick()
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
};

export { Render };
