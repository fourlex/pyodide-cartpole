import { asyncRun } from "./py-worker.js";

var modelParams;

async function main() {
  await asyncRun(`
    from cartpole.models import TwoCartsPendulum
    import js
    import numpy as np
    from pyodide.ffi import to_js
    model = TwoCartsPendulum(init_state=np.array([0.0,1,np.pi + 0.1,0,0,0]))
  `);

  let msg = await asyncRun(`
    to_js(model.params)
  `);
  modelParams = msg.results;

  window.requestAnimationFrame(draw);
}

var first_draw_moment = -1;
async function draw() {
  let t = performance.now()/1000;
  if (first_draw_moment == -1) {
    first_draw_moment = t;
  }
  t -= first_draw_moment;

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
  ctx.fillText(t.toFixed(1),20,20)

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