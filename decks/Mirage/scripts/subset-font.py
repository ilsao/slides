"""Subset the authored slide glyphs; requires fonttools and brotli."""
from html.parser import HTMLParser
from pathlib import Path
import json

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

deck = Path(__file__).resolve().parents[1]
project = deck.parents[1]


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


parser = Text()
parser.feed((deck / 'docs/visual-checks/rendered.html').read_text())
text = ''.join(parser.parts) + '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
source = project / 'public/fonts/SourceHanSansTW-VF.otf.woff2'
font = TTFont(source)
if 'fvar' in font:
    font = instantiateVariableFont(font, {'wght': 400}, inplace=True)
options = subset.Options()
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
# Preserve copyright / OFL records and replace the reserved family name on this derivative.
for name in font['name'].names:
    replacements = {1: 'Mirage Text Han', 3: 'MirageTextHan-Regular-2026',
                    4: 'Mirage Text Han Regular', 6: 'MirageTextHan-Regular',
                    16: 'Mirage Text Han', 25: 'MirageTextHan'}
    if name.nameID in replacements:
        name.string = replacements[name.nameID].encode(name.getEncoding())
font.flavor = 'woff2'
output = deck / 'assets/MirageTextHan-Subset.woff2'
font.save(output)
(deck / 'assets/SourceHanSans-LICENSE.txt').write_text(
    (project / 'public/fonts/source-han-sans-LICENSE.txt').read_text())
result = {'source': str(source.relative_to(project)), 'output': output.name,
          'weight': 400, 'characters': len(set(text)), 'bytes': output.stat().st_size,
          'familyRenamed': 'Mirage Text Han', 'license': 'SIL OFL 1.1'}
(deck / 'sources/font-subset.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
