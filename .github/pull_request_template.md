<!--
  The title follows Conventional Commits, exactly like a commit message:

      <type>(<scope>): <description>     e.g. fix(seo): correct the FAQPage structured data

  CONTRIBUTING.md has the types and this repository's scopes. A CI check
  validates the title and every commit on the branch.
-->

## What changes

<!-- One or two sentences. What is different once this merges? -->

## Why

<!-- The failure, request, or constraint behind it. Link the issue if there is one. -->

## How it was verified

<!-- Tick what you ran. Say what you exercised by hand — "it builds" is not verification. -->

- [ ] `python3 -m http.server 8000`
- [ ] Exercised by hand: <!-- which screens, endpoints, or jobs -->

## Risk

<!-- What could this break, and how would you notice? "None — copy only" is a fine
     answer. An empty section is not. -->

## Checklist

- [ ] Every commit follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) — `type(scope): description`
- [ ] The title above follows it too
- [ ] Breaking changes are marked `!` and explained in a `BREAKING CHANGE:` footer
- [ ] Documentation is updated in this same pull request
- [ ] The page still reads correctly with JavaScript disabled
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Structured data still mirrors the visible content
