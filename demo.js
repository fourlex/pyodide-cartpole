import { asyncRun } from "./py-worker.js";
async function main() {
  await asyncRun(`
    from cartpole.models import TwoCartsPendulum
    model = TwoCartsPendulum()
  `);
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

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.scale(canvas.width / 2, -canvas.height / 2);
  ctx.translate(1,-1);

  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(x1 - 0.05, -0.05, 0.1, 0.1);
  ctx.fillRect(x2 - 0.05, -0.05, 0.1, 0.1);

  ctx.restore();

  window.requestAnimationFrame(draw);
}

main();