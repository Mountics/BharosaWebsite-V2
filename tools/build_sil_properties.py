"""Build one detail page per SIL property.

Usage (from the site folder):  python tools/build_sil_properties.py

Reads  sil-properties/properties.json   (one entry per property)
       sil-properties/_template.html    (the page layout)
       sil-vacancy.html                 (header and footer are copied from here)
Writes sil-properties/<slug>.html

Photos go in assets/images/sil-properties/<slug>/ and are listed in the "photos" field.
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'sil-properties'

TICK = ('<span aria-hidden="true" style="flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: #00565e; '
        'color: #ffffff; display: flex; align-items: center; justify-content: center"><svg width="12" height="12" viewBox="0 0 24 24" '
        'fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"></path></svg></span>')
H2 = '<h2 style="margin: 0; font-size: 26px; line-height: 1.3; font-weight: 600; color: #00565e">{}</h2>'
P = '<p style="margin: 12px 0 0; font-size: 17px; line-height: 1.7; font-weight: 300; color: #3d4a4c">{}</p>'
SECTION = '<section style="margin-top: 40px; padding-top: 36px; border-top: 1px solid #dbe7ea">{}</section>'


def esc(text):
    return html.escape(text, quote=True)


def checklist(items):
    lis = ''.join(f'<li style="display: flex; align-items: flex-start; gap: 14px; font-size: 17px; line-height: 1.55; '
                  f'font-weight: 400; color: #2f3b3d">{TICK}<span>{x}</span></li>' for x in items)
    return f'<ul style="margin: 16px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px">{lis}</ul>'


def shell():
    """Header and footer from the SIL vacancy page, with links adjusted for one folder down."""
    page = (ROOT / 'sil-vacancy.html').read_text(encoding='utf-8')
    page = re.sub(r'((?:href|src)=")(?!https?:|#|mailto:|tel:|\.\./|data:)', r'\1../', page)
    head = page[:page.index('<main>') + len('<main>')]
    foot = page[page.index('</main>'):]
    return head, foot


def build(p, head, foot, template):
    photos = p['photos']
    base = f"../assets/images/sil-properties/{p['slug']}/"
    thumbs = []
    for i, (f, alt) in enumerate(photos):
        thumbs.append(
            f'<button type="button" data-gallery-src="{base}{f}" data-gallery-alt="{esc(alt)}" aria-label="Show photo {i + 1} of {len(photos)}"'
            f'{" aria-pressed=\"true\"" if i == 0 else " aria-pressed=\"false\""} class="pd-thumb" '
            'style="padding: 0; border: 0; border-radius: 14px; overflow: hidden; cursor: pointer; background: #cfe0e4">'
            f'<img src="{base}{f}" alt="" loading="lazy" style="display: block; width: 100%; height: 100%; object-fit: cover"></button>')

    facts = ''.join(
        f'<div style="background: #edf4f6; border-radius: 16px; padding: 16px 18px"><dt style="font-size: 13px; font-weight: 600; '
        f'letter-spacing: 0.4px; text-transform: uppercase; color: #55676a">{esc(k)}</dt><dd style="margin: 6px 0 0; font-size: 18px; '
        f'line-height: 1.35; font-weight: 600; color: #2f3b3d">{esc(v)}</dd></div>' for k, v in p['facts'].items())

    sections = [SECTION.format(H2.format('About the home') + ''.join(P.format(esc(x)) for x in p['description']))]
    for heading, text in p.get('extra_sections', []):
        sections.append(SECTION.format(H2.format(esc(heading)) + P.format(esc(text))))
    sections.append(SECTION.format(H2.format('Support model') + checklist(esc(x) for x in p['support_model'])))
    highlights = [f'<strong style="font-weight: 600">{esc(a)}</strong>' + (f': <span style="font-weight: 300; color: #3d4a4c">{esc(b)}</span>' if b else '')
                  for a, b in p['location_highlights']]
    sections.append(SECTION.format(H2.format('Location highlights') + checklist(highlights)))
    sections.append(SECTION.format(H2.format('Suitable for people who') + checklist(esc(x) for x in p['suitable_for'])))

    vac = int(p['facts'].get('Vacancies', '0') or 0)
    badge = f"{vac} room{'s' if vac != 1 else ''} available"
    body = template[template.index('-->') + 3:].lstrip()
    for token, value in {
        'TITLE': esc(p['title']), 'LOCATION': esc(p['location']), 'SUBTITLE': esc(p['subtitle']),
        'VACANCY_BADGE': badge, 'MAIN_SRC': base + photos[0][0], 'MAIN_ALT': esc(photos[0][1]),
        'THUMBS': '\n'.join(thumbs), 'THUMB_ROWS': str(-(-len(photos) // 3)),
'FACTS': facts, 'SECTIONS': '\n'.join(sections),
    }.items():
        body = body.replace('{{' + token + '}}', value)
    assert '{{' not in body, re.findall(r'\{\{\w+\}\}', body)

    page_head = re.sub(r'<title>.*?</title>', f"<title>{esc(p['title'])} | Bharosa Community Services</title>", head, count=1)
    (OUT / f"{p['slug']}.html").write_text(page_head + '\n' + body + foot, encoding='utf-8', newline='\n')
    return f"sil-properties/{p['slug']}.html"


def main():
    props = json.loads((OUT / 'properties.json').read_text(encoding='utf-8'))
    template = (OUT / '_template.html').read_text(encoding='utf-8')
    head, foot = shell()
    for p in props:
        print('built', build(p, head, foot, template))


if __name__ == '__main__':
    main()
