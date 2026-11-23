import zipfile
import os
import shutil

def col_letter(col_idx):
    result = ""
    col_idx += 1
    while col_idx > 0:
        col_idx, remainder = divmod(col_idx - 1, 26)
        result = chr(65 + remainder) + result
    return result

def escape_xml(s):
    if s is None:
        return ""
    s = str(s)
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;")
             .replace("'", "&apos;"))

class ExcelWorkbookBuilder:
    def __init__(self, filename):
        self.filename = filename
        self.sheets = []

    def add_sheet(self, name, rows, col_widths=None):
        self.sheets.append({
            'name': name,
            'rows': rows,
            'col_widths': col_widths or []
        })

    def build_styles_xml(self):
        return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="8">
    <!-- 0: Regular 10pt -->
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Segoe UI"/></font>
    <!-- 1: Header Bold White 10.5pt -->
    <font><b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Segoe UI"/></font>
    <!-- 2: Sheet Title 14pt Bold -->
    <font><b/><sz val="14"/><color rgb="FF0F172A"/><name val="Segoe UI"/></font>
    <!-- 3: Bold Cell 10pt -->
    <font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Segoe UI"/></font>
    <!-- 4: Italic Note 9pt -->
    <font><i/><sz val="9"/><color rgb="FF64748B"/><name val="Segoe UI"/></font>
    <!-- 5: Status Pill Bold Green -->
    <font><b/><sz val="9.5"/><color rgb="FF166534"/><name val="Segoe UI"/></font>
    <!-- 6: Status Pill Bold Amber -->
    <font><b/><sz val="9.5"/><color rgb="FF9A3412"/><name val="Segoe UI"/></font>
    <!-- 7: Code font 9.5pt -->
    <font><sz val="9.5"/><color rgb="FF0F172A"/><name val="Consolas"/></font>
  </fonts>
  <fills count="10">
    <!-- 0: none -->
    <fill><patternFill patternType="none"/></fill>
    <!-- 1: gray125 -->
    <fill><patternFill patternType="gray125"/></fill>
    <!-- 2: Dark Blue Header (#1E3A8A) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/></fgColor></patternFill></fill>
    <!-- 3: Light Slate Zebra (#F8FAFC) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></fgColor></patternFill></fill>
    <!-- 4: Light Green Pill (#DCFCE7) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></fgColor></patternFill></fill>
    <!-- 5: Light Amber Pill (#FEF3C7) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></fgColor></patternFill></fill>
    <!-- 6: Teal Section Header (#0F766E) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/></fgColor></patternFill></fill>
    <!-- 7: Soft Blue Banner (#E0E7FF) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFE0E7FF"/></fgColor></patternFill></fill>
    <!-- 8: Card Accent Fill (#EFF6FF) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/></fgColor></patternFill></fill>
    <!-- 9: Indigo Header (#312E81) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF312E81"/></fgColor></patternFill></fill>
  </fills>
  <borders count="2">
    <!-- 0: None -->
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <!-- 1: Thin border (#CBD5E1) -->
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="13">
    <!-- 0: Default Normal (font 0, fill 0, border 0) -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <!-- 1: Table Header Dark Blue (font 1 white bold, fill 2 navy, border 1, center wrap) -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <!-- 2: Sheet Title Banner (font 2, fill 7, border 0) -->
    <xf numFmtId="0" fontId="2" fillId="7" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <!-- 3: Data Cell Normal Bordered (font 0, fill 0, border 1, left wrap) -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <!-- 4: Zebra Row Cell (font 0, fill 3, border 1, left wrap) -->
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <!-- 5: Bold Cell (font 3, fill 0, border 1, left wrap) -->
    <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <!-- 6: Green Pill / Must / Success (font 5, fill 4, border 1, center) -->
    <xf numFmtId="0" fontId="5" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 7: Amber Pill / Should / Pending (font 6, fill 5, border 1, center) -->
    <xf numFmtId="0" fontId="6" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 8: Section Subheader Teal (font 1 white bold, fill 6 teal, border 1) -->
    <xf numFmtId="0" fontId="1" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <!-- 9: Centered Normal Cell (font 0, fill 0, border 1, center) -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 10: Centered Zebra Cell (font 0, fill 3, border 1, center) -->
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 11: Callout / Card Cell (font 3 bold, fill 8 light blue, border 1) -->
    <xf numFmtId="0" fontId="3" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <!-- 12: Code Monospace Cell (font 7 code, fill 3 zebra, border 1) -->
    <xf numFmtId="0" fontId="7" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
  </cellXfs>
</styleSheet>"""

    def build_sheet_xml(self, sheet):
        xml_parts = []
        xml_parts.append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
        xml_parts.append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
        
        if sheet['col_widths']:
            xml_parts.append('  <cols>')
            for i, w in enumerate(sheet['col_widths']):
                xml_parts.append(f'    <col min="{i+1}" max="{i+1}" width="{w}" customWidth="1"/>')
            xml_parts.append('  </cols>')
            
        xml_parts.append('  <sheetData>')
        for r_idx, row in enumerate(sheet['rows']):
            row_num = r_idx + 1
            xml_parts.append(f'    <row r="{row_num}">')
            for c_idx, cell in enumerate(row):
                if cell is None:
                    continue
                val, style_id = cell if isinstance(cell, tuple) else (cell, 0)
                cell_ref = f"{col_letter(c_idx)}{row_num}"
                val_escaped = escape_xml(val)
                xml_parts.append(f'      <c r="{cell_ref}" s="{style_id}" t="inlineStr"><is><t>{val_escaped}</t></is></c>')
            xml_parts.append('    </row>')
        xml_parts.append('  </sheetData>')
        xml_parts.append('</worksheet>')
        return "\n".join(xml_parts)

    def save(self):
        with zipfile.ZipFile(self.filename, 'w', zipfile.ZIP_DEFLATED) as z:
            ct = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
                  '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
                  '  <Default Extension="xml" ContentType="application/xml"/>',
                  '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
                  '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>']
            for i in range(len(self.sheets)):
                ct.append(f'  <Override PartName="/xl/worksheets/sheet{i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
            ct.append('</Types>')
            z.writestr('[Content_Types].xml', "\n".join(ct))

            rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""
            z.writestr('_rels/.rels', rels)

            wb = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                  '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
                  '  <sheets>']
            for i, sheet in enumerate(self.sheets):
                wb.append(f'    <sheet name="{escape_xml(sheet["name"])}" sheetId="{i+1}" r:id="rId{i+1}"/>')
            wb.append('  </sheets>')
            wb.append('</workbook>')
            z.writestr('xl/workbook.xml', "\n".join(wb))

            wb_rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                       '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">']
            for i in range(len(self.sheets)):
                wb_rels.append(f'  <Relationship Id="rId{i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i+1}.xml"/>')
            wb_rels.append(f'  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
            wb_rels.append('</Relationships>')
            z.writestr('xl/_rels/workbook.xml.rels', "\n".join(wb_rels))

            z.writestr('xl/styles.xml', self.build_styles_xml())

            for i, sheet in enumerate(self.sheets):
                z.writestr(f'xl/worksheets/sheet{i+1}.xml', self.build_sheet_xml(sheet))

print("Excel builder loaded.")
