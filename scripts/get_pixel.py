import sys
from PIL import Image

img = Image.open('src/imports/lock-illustration.png')
rgb = img.convert('RGB').getpixel((0, 0))
print('#%02x%02x%02x' % rgb)
