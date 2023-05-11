import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.mjs';

async function main() {
  let pyodide = await loadPyodide();
  console.log('python version: ' + pyodide.runPython('import sys; sys.version'));

  await pyodide.loadPackage("numpy");
  console.log('numpy version: ' + pyodide.runPython('import numpy; numpy.version.version'));

  await pyodide.loadPackage("scipy");
  console.log('scipy version: ' + pyodide.runPython('import scipy; scipy.__version__'));

  await pyodide.loadPackage('python_code/dist/cartpole-0.0.1-py3-none-any.whl');
  console.log('cartole params: ');
  console.log(pyodide.runPython(`
    from cartpole.models import TwoCartsPendulum
    model = TwoCartsPendulum()
    model.params
  `).toJs());
}

main();