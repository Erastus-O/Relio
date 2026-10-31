s = open('/app/scripts/site/site.html').read()

anchor = 'data-a="rate">Are my prices high enough?</button></div>'
assert s.count(anchor) == 1
form = ('<form class="askform" id="askform" autocomplete="off" data-testid="assistant-ask-form">'
        '<label for="askq" class="sr-only">Ask your own question</label>'
        '<input id="askq" name="q" type="text" maxlength="500" placeholder="Or ask your own question about the platform" data-testid="assistant-question-input">'
        '<button type="submit" id="askbtn" data-testid="assistant-ask-button">Ask <span aria-hidden="true">→</span></button></form>'
        '<p class="askhint" id="askhint" data-testid="assistant-live-hint">Live answers, powered by AI. It knows this page, not your workspace.</p>')
s = s.replace(anchor, anchor + form)

extra = open('/app/scripts/site/extra.html').read()
s = s.replace('</body></html>', extra + '\n</body></html>')
open('/app/frontend/public/site.html', 'w').write(s)
print('ok', len(s))
