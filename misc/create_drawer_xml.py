"""Quick'n'Dirty Python script to generate example XML for the drawers

    Place in the Kupu package root, adjust vars and run with a Python
    with PIL installed (obviously it wouldn't be too hard to either
    remove the dependency or let the script handle non-images, but this
    wasn't the usecase for now ;)

"""

import os, re
from PIL import Image

path = 'kupuimages'
title = 'Kupu buttons'
outputfile = 'kupudrawers/kupubuttons.xml'
filereg = '\.png$'

os.chdir('common')

xml = ('<?xml version="1.0" ?>\n'
        '<collection>\n'
        '   <uri>%(outputfile)s</uri>\n'
        '   <icon>kupuimages/kupulibrary.png</icon>\n'
        '   <title>%(title)s</title>\n'
        '   <src>%(outputfile)s</src>\n'
        '   <items>\n') % {'path': path,
                            'title': title,
                            'outputfile': outputfile,
                            }

reg = re.compile(filereg)
chunks = []
for f in os.listdir(path):
    if reg.search(f):
        img = Image.open('%s/%s' % (path, f))
        vars = {'filename': f,
                'title': '.'.join(f.split('.')[:-1]),
                'path': '%s/%s' % (path, f),
                'size': os.path.getsize('%s/%s' % (path, f)),
                'width': img.size[1],
                'height': img.size[0],
                }
        chunks.append(('        <resource id="%(filename)s">\n'
                        '            <uri>%(path)s</uri>\n'
                        '            <title>%(title)s</title>\n'
                        '            <description></description>\n'
                        '            <size>%(size)s</size>\n'
                        '            <height>%(height)s</height>\n'
                        '            <width>%(width)s</width>\n'
                        '        </resource>\n') % vars)

xml += ''.join(chunks) + '    </items>\n</collection>\n'

open(outputfile, 'w').write(xml)
