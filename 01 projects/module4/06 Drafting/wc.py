import ast, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

src = open('make_essay.py', encoding='utf-8').read()
tree = ast.parse(src)

def strval(node):
    # concatenated string literal -> value
    try:
        return ast.literal_eval(node)
    except Exception:
        return None

body_words = 0
head_words = 0

def clean(t):
    t = re.sub(r'<[^>]+>', '', t)          # strip <i> tags
    t = re.sub(r'&#?\w+;', ' ', t)          # strip HTML entities (&#8212; &amp;)
    return t

def count(t):
    return len(re.findall(r"[A-Za-z0-9'’-]+", clean(t)))

for n in ast.walk(tree):
    if isinstance(n, ast.Call) and isinstance(n.func, ast.Name):
        fn = n.func.id
        if fn == 'P' and n.args:
            v = strval(n.args[0])
            if isinstance(v, str):
                body_words += count(v)
        elif fn == 'Paragraph' and len(n.args) >= 2:
            # heading or body paragraph; check 2nd arg style name
            style = getattr(n.args[1], 'id', None)
            v = strval(n.args[0])
            if isinstance(v, str):
                if style in ('H1', 'H2', 'TT', 'TS', 'TM'):
                    head_words += count(v)
                elif style == 'BODY':
                    body_words += count(v)

print('BODY paragraph words (P + Paragraph/BODY):', body_words)
print('Heading/cover words (H1/H2/cover):', head_words)
print('Body + headings:', body_words + head_words)
