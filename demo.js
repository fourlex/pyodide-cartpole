import { asyncRun } from "./py-worker.js";

var modelParams;

async function main() {
  await asyncRun(`
    from cartpole.models import TwoCartsPendulum
    import js
    import numpy as np
    from pyodide.ffi import to_js
    model = TwoCartsPendulum(init_state=np.array([0.0,0.5,np.pi,0,0,0]), L=0.5, M1=0.001, m=0.2, l=0.6)
  `);

  let msg = await asyncRun(`
    to_js(model.params)
  `);
  modelParams = msg.results;

  window.requestAnimationFrame(draw);
}

async function draw() {
  let msg = await asyncRun(`
    model.step(dt=js.t-model.time_elapsed)
    to_js(model.state.tolist())
  `, {t: performance.now()/1000});
  let state = msg.results;
  const x1 = state[0];
  const x2 = state[1];
  const th = state[3];
  const l = modelParams[6];

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.scale(100, -100);
  ctx.translate(1,-1);

  // let bbox = {
  //   x1: Math.min(x1 - 0.05, x2 - l * Math.sin(th)),
  //   x2: Math.max(x2 + 0.05, x2 - l * Math.sin(th)),
  //   y1: Math.min(-0.05, l * -Math.cos(th)),
  //   y2: Math.max(0.05, l * -Math.cos(th))
  // };
  // ctx.lineWidth = 0.005;
  // ctx.strokeStyle = "rgb(33,33,33)";
  // ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 -bbox.x1, bbox.y2 - bbox.y1);

  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(x1 - 0.05, -0.05, 0.1, 0.1);
  ctx.fillRect(x2 - 0.05, -0.05, 0.1, 0.1);
  ctx.lineWidth = 0.01;
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.beginPath();
  ctx.moveTo(x2, 0);
  ctx.lineTo(x2 - l * Math.sin(th), l * -Math.cos(th))
  ctx.stroke();

  ctx.restore();

  window.requestAnimationFrame(draw);
}

main();