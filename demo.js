import { asyncRun } from "./py-worker.js";

var modelParams;
var firstDrawMoment = -1;

async function resetSimulation() {
  firstDrawMoment = -1;
  await asyncRun(`
    model = TwoCartsPendulum(init_state=np.array([0.0,1,np.pi + 0.1,0,0,0]))
  `); 
}

document.getElementById("reset").onclick = resetSimulation;

async function main() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillText("Loading...",20,20)

  await asyncRun(`
    from cartpole.models import TwoCartsPendulum
    import js
    import numpy as np
    from pyodide.ffi import to_js
  `);

  await resetSimulation();
  let msg = await asyncRun(`
    to_js(model.params)
  `);
  modelParams = msg.results;

  window.requestAnimationFrame(draw);
}

async function draw() {
  let t = performance.now()/1000;
  if (firstDrawMoment == -1) {
    firstDrawMoment = t;
  }
  t -= firstDrawMoment;

  let msg = await asyncRun(`
    model.step(dt=js.t-model.time_elapsed)
    to_js(model.state.tolist())
  `, {t});
  let state = msg.results;
  const x1 = state[0];
  const x2 = state[1];
  const th = state[2];
  const l = modelParams[6];

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // time
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillText("t = " + t.toFixed(1) + "s",20,20)

  ctx.scale(200, -200);
  ctx.translate(1,-1);

  // spring
  let nChains = 50;
  let chainWidth = 0.03;
  ctx.beginPath();
  ctx.lineWidth = 0.01;
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.moveTo(x1, 0);
  for (let i = 0; i < nChains; i++) {
    ctx.lineTo(x1 + (i) * (x2 - x1)/nChains, -chainWidth/2 + chainWidth * (i % 2));
  }
  ctx.lineTo(x2, 0)
  ctx.stroke();

  // carts
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(x1 - 0.05, -0.05, 0.1, 0.1);
  ctx.fillRect(x2 - 0.05, -0.05, 0.1, 0.1);

  // pole
  ctx.lineWidth = 0.01;
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.beginPath();
  ctx.moveTo(x2, 0);
  ctx.lineTo(x2 + l * Math.sin(th), l * -Math.cos(th))
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.arc(x2 + l * Math.sin(th), l * -Math.cos(th), 0.03, 2 * Math.PI, false);
  ctx.fill();

  ctx.restore();

  window.requestAnimationFrame(draw);
}

main();