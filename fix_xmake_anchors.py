import glob, re
files = glob.glob('./**/*.md', recursive=True) + glob.glob('./**/*.markdown', recursive=True)
pattern = re.compile(r'#(?:target|option)([a-z_]+)')
def repl(m):
    return '#' + m.group(1).replace('_', '-')
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    new_content = pattern.sub(repl, content)
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
