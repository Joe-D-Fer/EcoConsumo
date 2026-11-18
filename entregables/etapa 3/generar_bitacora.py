import sys, re
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

src, dst = sys.argv[1], sys.argv[2]
lines = open(src, encoding='utf-8').read().splitlines()

def shade(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), color)
    tcPr.append(shd)

def write(cell, text, bold=False, color=None, size=8):
    cell.text = ''
    p = cell.paragraphs[0]
    r = p.add_run(text); r.bold = bold; r.font.size = Pt(size); r.font.name = 'Arial'
    if color: r.font.color.rgb = RGBColor(*color)

doc = Document()
s = doc.sections[0]
s.orientation = WD_ORIENT.LANDSCAPE
s.page_width, s.page_height = s.page_height, s.page_width
for m in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'):
    setattr(s, m, Cm(1.5))
doc.styles['Normal'].font.name = 'Arial'
doc.styles['Normal'].font.size = Pt(10)

COLS = ['N°', 'Fecha', 'Horario', 'Tipo', 'Tarea', 'Responsable(s)', 'Estado']
WIDTHS = [0.9, 2.7, 2.2, 1.9, 11.5, 4.0, 2.0]
table = None
for ln in lines:
    if ln.startswith('# '):
        h = doc.add_heading(ln[2:], 1)
    elif ln.startswith('## '):
        title = ln[3:]; table = None
        doc.add_paragraph()
        table = doc.add_table(rows=2, cols=len(COLS)); table.style = 'Table Grid'
        top = table.rows[0].cells[0].merge(table.rows[0].cells[-1])
        write(top, 'Bitácora – ' + title, True, (255, 255, 255), 10); shade(top, 'FF0000')
        for i, c in enumerate(COLS):
            write(table.rows[1].cells[i], c, True); shade(table.rows[1].cells[i], 'D9D9D9')
    elif ln.startswith('|') and table is not None:
        cells = [c.strip() for c in ln.strip('|').split('|')]
        if cells[0] in ('N°', '---') or set(cells[0]) <= set('-'):
            continue
        row = table.add_row().cells
        for i in range(len(COLS)):
            write(row[i], cells[i])
        if len(table.rows) % 2 == 1:
            for c in row: shade(c, 'F2DCDB')
    elif ln.strip() and table is None:
        p = doc.add_paragraph()
        for i, part in enumerate(re.split(r'\*\*(.+?)\*\*', ln)):
            r = p.add_run(part); r.bold = (i % 2 == 1)
for t in doc.tables:
    t.autofit = False
    for row in t.rows[1:]:
        for i, c in enumerate(row.cells):
            c.width = Cm(WIDTHS[i])
doc.save(dst)
print('ok', len(doc.tables))
