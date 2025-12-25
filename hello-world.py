#!/usr/bin/env python3
import time
import sys
import os
import shutil
import random
import locale
import unicodedata
from typing import Callable

lang = locale.getlocale()[0] or 'en_US'
lang_code = lang.replace('_', '-').lower()

try:
  with open(os.path.join(os.path.dirname(__file__), 'i18n', f'{lang_code}.txt')) as f:
    texts = f.read()
except:
  with open(os.path.join(os.path.dirname(__file__), 'i18n', 'en-us.txt')) as f:
    texts = f.read()

code_dir = os.path.join(os.path.dirname(__file__), 'code')
files = [f for f in os.listdir(code_dir) if os.path.isfile(os.path.join(code_dir, f))]

char_delay = 0.05


def render_frame(texts: str, pre_run: Callable, i: int) -> bool:
  not_end = False
  start_time = time.time()
  columns = shutil.get_terminal_size().columns or 80
  print('\033[H', end='')
  pre_run()
  for l, text in enumerate(texts.splitlines()):
    text_list = []
    for ch in text:
      if ch == '\t':
        text_list.append((8, ch))
        text_list.extend([(0, '')] * 7)
      elif unicodedata.east_asian_width(ch) in ['F', 'W']:
        text_list.append((2, ch))
        text_list.append((0, ''))
      else:
        text_list.append((1, ch))
    chars = [' '] * columns
    for j, (w, char) in enumerate(text_list):
      if char == '':
        continue
      t = i / 100 - j * char_delay - l * 0.5
      if t > 1:
        if j + w - 1 < columns:
          chars[j] = char
          for k in range(1, w):
            chars[j + k] = ''
        continue
      not_end = True
      if t < 0:
        continue
      n = int((1 - t)**3 * columns)
      if j + n + w - 1 < columns:
        chars[j + n] = char
        for k in range(1, w):
          chars[j + n + k] = ''
    print(''.join(chars))
  sys.stdout.flush()
  time.sleep(0.01 - (time.time() - start_time))
  return not_end


print('\033[?1049h\033[?25l', end='', flush=True)

try:
  i = 0
  while render_frame(texts, lambda: None, i):
    i += 1
  while True:
    random_file = random.choice(files)
    with open(os.path.join(code_dir, random_file)) as f:
      code = f.read().replace('$$$', texts.splitlines()[0])
    print('\033[H\033[2J', end='')
    i = 0
    while render_frame(code, lambda: print(texts), i):
      i += 1
    time.sleep(1)
except:
  pass

print('\033[?25h\033[?1049l', end='', flush=True)

print(texts, flush=True)
