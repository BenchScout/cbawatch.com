#!/usr/bin/env bash
#
# Validates Conventional Commits 1.0.0 across a pull request.
#   https://www.conventionalcommits.org/en/v1.0.0/
#
# Checks every non-merge commit between the merge base and the pull request
# head, plus the pull request title itself. Run it locally before pushing:
#
#   BASE_REF=main bash .github/scripts/check-conventional-commits.sh
#
# Exits non-zero and prints every offending header, so one run tells you
# everything that needs fixing rather than one problem at a time.

set -euo pipefail

TYPES='build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test'
HEADER_PATTERN="^(${TYPES})(\([a-z0-9][a-z0-9._/-]*\))?!?: .+"
MAX_HEADER_LENGTH=72

failures=0

note() { printf '%s\n' "$1"; }
fail() { printf '\n  FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }
detail() { if [[ -z "${1:-}" ]]; then printf '\n' >&2; else printf '        %s\n' "$1" >&2; fi; }

# Validates a single header line — the first line of a commit message, or a
# pull request title. Both obey exactly the same rules.
check_header() {
  local label="$1" header="$2" description

  # `git revert` writes its own subject and there is nothing to be gained by
  # making people hand-edit it. The spec's `revert:` type stays available for
  # reverts you write yourself.
  if [[ "$header" == Revert\ \"* ]]; then
    note "  skip  ${label} (git-generated revert)"
    return 0
  fi

  if ! [[ "$header" =~ $HEADER_PATTERN ]]; then
    fail "$label"
    detail "$header"
    detail ""
    detail "does not match <type>(<optional scope>): <description>"
    detail "types: ${TYPES//|/, }"
    detail "scope is optional, lowercase; add ! before the colon for a breaking change"
    return 0
  fi

  description="${header#*: }"

  if (( ${#header} > MAX_HEADER_LENGTH )); then
    fail "$label"
    detail "$header"
    detail ""
    detail "header is ${#header} characters; keep it to ${MAX_HEADER_LENGTH} or fewer"
    return 0
  fi

  # Sentence case, but not an acronym: "Add the thing" is wrong, while
  # "ESPN backfill" is a legitimate way to start a description.
  if [[ "$description" =~ ^[A-Z][a-z] ]]; then
    fail "$label"
    detail "$header"
    detail ""
    detail "start the description in lowercase: '${description}'"
    return 0
  fi

  if [[ "$description" == *. ]]; then
    fail "$label"
    detail "$header"
    detail ""
    detail "drop the trailing period"
    return 0
  fi

  note "  ok    ${label}"
}

# The body, when there is one, must be separated from the description by a
# blank line. Pull request titles are a single line and skip this.
check_blank_line_before_body() {
  local label="$1" message="$2" second_line

  second_line="$(printf '%s\n' "$message" | sed -n '2p')"
  if [[ -n "$second_line" ]]; then
    fail "$label"
    detail "$second_line"
    detail ""
    detail "leave a blank line between the description and the body"
  fi
}

echo "Conventional Commits 1.0.0 — https://www.conventionalcommits.org/en/v1.0.0/"
echo

# ---------------------------------------------------------------- commits ---

BASE_REF="${BASE_REF:-}"
HEAD_SHA="${HEAD_SHA:-HEAD}"

if [[ -n "$BASE_REF" ]]; then
  # The base branch can move while a pull request is open, so compare against
  # the merge base rather than the tip: only commits this branch actually adds
  # are this branch's responsibility.
  if ! merge_base="$(git merge-base "origin/${BASE_REF}" "$HEAD_SHA" 2>/dev/null)"; then
    merge_base="$(git merge-base "$BASE_REF" "$HEAD_SHA")"
  fi
  range="${merge_base}..${HEAD_SHA}"
else
  range="$HEAD_SHA"
fi

mapfile -t shas < <(git log --no-merges --format=%H "$range")

if (( ${#shas[@]} == 0 )); then
  note "No non-merge commits to check in ${range}."
else
  note "Commits in ${range}:"
  for sha in "${shas[@]}"; do
    message="$(git log -1 --format=%B "$sha")"
    header="$(printf '%s\n' "$message" | head -n 1)"
    check_header "${sha:0:8}  ${header}" "$header"
    check_blank_line_before_body "${sha:0:8}  (body)" "$message"
  done
fi

# --------------------------------------------------------------- pr title ---

if [[ -n "${PR_TITLE:-}" ]]; then
  echo
  note "Pull request title:"
  check_header "title  ${PR_TITLE}" "$PR_TITLE"
fi

# ----------------------------------------------------------------- verdict ---

echo
if (( failures > 0 )); then
  echo "${failures} message(s) do not follow the convention." >&2
  echo >&2
  echo "Fix the most recent one with:      git commit --amend" >&2
  echo "Fix several with:                  git rebase -i ${BASE_REF:-main}  (reword)" >&2
  echo "Then:                              git push --force-with-lease" >&2
  echo >&2
  echo "The convention, with this repository's scopes, is in CONTRIBUTING.md." >&2
  exit 1
fi

echo "Every commit message and the pull request title follow the convention."
