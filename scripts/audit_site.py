"""Audit static local HTML/CSS references without external dependencies."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {'.git', 'node_modules', 'archive', '__pycache__'}


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if value and key in {'src', 'href', 'poster'}:
                self.refs.append((self.getpos()[0], value))


def audit():
    files = sorted(p for p in ROOT.rglob('*') if p.is_file()
                   and not EXCLUDED.intersection(p.relative_to(ROOT).parts)
                   and 'backup-before-' not in str(p) and '.antes-' not in p.name)
    issues = []
    checked = 0
    for path in files:
        if path.suffix.lower() not in {'.html', '.css'}:
            continue
        checked += 1
        source = path.read_text(encoding='utf-8-sig')
        if path.suffix.lower() == '.html':
            parser = References()
            parser.feed(source)
            refs = parser.refs
        else:
            refs = [(source.count('\n', 0, m.start()) + 1, m.group(1).strip(' "\''))
                    for m in re.finditer(r'url\(([^)]+)\)', source)]
        for line, ref in refs:
            if ref.startswith(('#', '//')) or any(c in ref for c in ('${', '{{', '<%')):
                continue
            url = urlsplit(ref)
            if url.scheme or not url.path:
                continue
            target = (ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/')
                      else path.parent / unquote(url.path))
            if not target.exists():
                issues.append({'file': path.relative_to(ROOT).as_posix(), 'line': line, 'reference': ref})
    result = {'files': len(files), 'pages_and_styles_checked': checked,
              'extensions': dict(sorted(Counter(p.suffix.lower() or '(none)' for p in files).items())),
              'missing_static_references': issues}
    report = ROOT / 'docs' / 'auditoria-enlaces.json'
    report.parent.mkdir(exist_ok=True)
    report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(files)} files; {checked} HTML/CSS; {len(issues)} missing references. Report: {report}')


if __name__ == '__main__':
    audit()
