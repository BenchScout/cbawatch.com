# Contributing to cbawatch.com

**cbawatch.com** is a single-page site making the case for a salary cap ahead
of the December 2026 CBA expiry. Plain HTML, CSS, and vanilla JavaScript —
no build step, no dependencies.

- [Commits](#commits)
- [Pull requests](#pull-requests)
- [Before you push](#before-you-push)

## Commits

This repository follows **[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)**.

Pull requests here are merged rather than squashed, so every commit on your
branch lands on `main` and stays there. A commit message is read far more often
than it is written — usually by whoever is bisecting a regression at an
inconvenient hour — and the convention is what makes the history greppable:
`git log --oneline --grep '^fix(api)'` should be a useful question to ask.

[A CI check](.github/workflows/commit-convention.yml) validates every commit a
pull request adds, and the pull request title. Run it yourself before pushing:

```bash
BASE_REF=main bash .github/scripts/check-conventional-commits.sh
```

### The shape of a message

```
<type>(<scope>)<!>: <description>

<body>

<footer>
```

Only the first line is required. The scope is optional, `!` marks a breaking
change, and the body and each footer are separated from what precedes them by a
blank line.

### Types

| Type | Use it when |
| --- | --- |
| `feat` | the change adds a capability |
| `fix` | the change corrects behaviour that was wrong |
| `perf` | the behaviour is the same and the cost is lower |
| `refactor` | the code moved or changed shape; the behaviour did not |
| `docs` | documentation only |
| `style` | formatting, whitespace, naming — nothing a reader of the output would notice |
| `test` | tests and verification scripts only |
| `build` | the build itself, packaging, or a dependency bump |
| `ci` | workflows and everything under `.github/` |
| `chore` | housekeeping that fits nothing above — reach for it last, not first |
| `revert` | the change undoes an earlier commit |

Prefer the specific type. `chore` is the one that means nothing to a reader, so
it should be the last thing you reach for rather than the first.

### Scopes

| Scope | What it covers |
| --- | --- |
| `content` | the copy in `index.html` |
| `design` | `styles.css` — theming, layout, motion |
| `charts` | the payroll and deferral charts and their tooltips |
| `countdown` | the doom clock and the animated counters in `app.js` |
| `seo` | meta tags, JSON-LD, `robots.txt`, `sitemap.xml` |
| `assets` | fonts, icons, the share card |
| `a11y` | focus order, reduced motion, the data-table fallbacks |
| `docs` | documentation, when the change is only documentation |
| `deps` | dependency bumps |
| `ci` | workflows and everything under `.github/` |

The scope is optional — leave it off when a change genuinely spans the whole
repository rather than picking one at random. The CI check does not enforce this
list, so a scope that isn't here will pass; if you add one, add it to this table
in the same commit, or the table quietly stops being true.

### The description

- **Imperative mood.** "add the props tab", not "added" or "adds". It should
  complete the sentence *"If applied, this commit will…"*.
- **Lowercase**, unless the first word is a name or an acronym —
  `fix(api): ESPN backfill drops college football` is fine.
- **No trailing period.**
- **72 characters** for the whole first line, type and scope included.
- Say what changed, not which files changed. The diff already lists the files.

```
feat(charts): add a deferred-salary breakdown by club
fix(countdown): keep the hero clock readable when app.js fails
style(design): tighten the hairline rules on mobile
fix(seo): correct the FAQPage structured data
```

### The body

Optional, and worth writing whenever the change is not self-evident from the
diff. The body is for the **why**: the failure that motivated the change, the
approach you rejected and what was wrong with it, the constraint that made the
obvious thing impossible. Wrap it at 72 columns.

What the code does is in the code. What it does *not* do, and why, is only ever
in the message.

### Breaking changes

Two ways to mark one, and using both is better than using either:

- a `!` before the colon — `feat(content)!: retire the pre-expiry framing after December 2026`
- a `BREAKING CHANGE:` footer saying what breaks and what to do about it

```
feat(content)!: retire the pre-expiry framing after December 2026

Rare here. Use it when a change makes a shared link point at something
materially different from what was shared.

BREAKING CHANGE: the #the-gap anchor is now #payroll. Links already shared
into the old anchor land at the top of the page.
```

### Footers

`Refs: #12`, `Closes #12`, `Co-Authored-By: …`, and `BREAKING CHANGE: …`. One
per line, after a blank line.

### A template for the editor

```bash
git config commit.template .gitmessage
```

That puts the types, this repository's scopes, and the rules in front of you
every time you write a message. It is per-clone, so it needs running once.

### The history that predates this

Commits made before this convention was adopted are prose sentences — *"Stop the
archive pass once the archive stops answering"*. They are not being rewritten,
and nothing needs to be done about them. The check only looks at the commits a
pull request adds, so old history stays exactly as it is.

## Pull requests

**Branch off `main`.** Push, open a pull request, and let CI run before asking
anyone to look.

**The title follows the same convention as a commit** — it is what the merge
commit carries, and the check validates it.

**Fill in the [template](.github/pull_request_template.md).** It asks what
changed, why, how you verified it, and what could break. If a section does not
apply, say so rather than deleting it — "no risk, this is copy only" is an
answer, and a deleted section is not.

**One logical change per pull request.** A rename that touches sixty files and a
behaviour change belong in two, or at minimum in two commits, so the interesting
one is reviewable. If the description needs the word "also" more than once,
split it.

**Update the documentation in the same pull request.** Documentation in a later
pull request is documentation that is wrong in between.

## Before you push

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

There is no build step and no test suite, so the check is the page itself.
Load it with JavaScript disabled too — the site is expected to stay readable
when `app.js` does not run.

All motion respects `prefers-reduced-motion`, charts keep their
keyboard-focusable rows and data-table fallback, and the JSON-LD in the head
mirrors the visible FAQ. A change to one of those is a change to both.

