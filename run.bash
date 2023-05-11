#!/usr/bin/env bash
set -euxo pipefail

cd python_code
/usr/bin/env python setup.py bdist_wheel
cd ..
/usr/bin/env python -m http.server