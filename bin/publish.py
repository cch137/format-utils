import os
import shutil

shutil.rmtree('dist', ignore_errors=True)
os.system('tsc')

os.system(' && '.join([
  'npm publish --access public',
]))
