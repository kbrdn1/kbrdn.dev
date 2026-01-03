#!/usr/bin/env bash

set -e

JSON_MODE=false
SHORT_NAME=""
ISSUE_NUMBER=""
BRANCH_TYPE="feat"
ARGS=()
i=1
while [ $i -le $# ]; do
    arg="${!i}"
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --short-name)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            SHORT_NAME="$next_arg"
            ;;
        --issue)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --issue requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --issue requires a value' >&2
                exit 1
            fi
            ISSUE_NUMBER="$next_arg"
            ;;
        --type)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --type requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --type requires a value' >&2
                exit 1
            fi
            # Validate branch type
            case "$next_arg" in
                feat|fix|hotfix|docs|refactor|chore)
                    BRANCH_TYPE="$next_arg"
                    ;;
                *)
                    echo "Error: Invalid branch type '$next_arg'. Must be one of: feat, fix, hotfix, docs, refactor, chore" >&2
                    exit 1
                    ;;
            esac
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] <feature_description>"
            echo ""
            echo "Creates a new feature branch following CONTRIBUTING.md convention:"
            echo "  <type>/#<issue-number>-<short-description>"
            echo ""
            echo "Options:"
            echo "  --json              Output in JSON format"
            echo "  --short-name <name> Provide a custom short name (2-4 words) for the branch"
            echo "  --issue N           Specify GitHub issue number (required)"
            echo "  --type <type>       Branch type: feat, fix, hotfix, docs, refactor, chore (default: feat)"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 'Add GitHub contributions chart' --issue 12"
            echo "  $0 'Fix hydration error' --issue 45 --type fix"
            echo "  $0 'Update README' --issue 23 --type docs --short-name 'update-readme'"
            exit 0
            ;;
        *)
            ARGS+=("$arg")
            ;;
    esac
    i=$((i + 1))
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Usage: $0 [OPTIONS] <feature_description>" >&2
    echo "Run '$0 --help' for more information." >&2
    exit 1
fi

# Issue number is required per CONTRIBUTING.md convention
if [ -z "$ISSUE_NUMBER" ]; then
    echo "Error: --issue <number> is required. Create a GitHub issue first." >&2
    echo "Branch convention: <type>/#<issue-number>-<short-description>" >&2
    exit 1
fi

# Function to find the repository root by searching for existing project markers
find_repo_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Function to check if issue number already has a spec directory
check_issue_exists() {
    local specs_dir="$1"
    local issue_num="$2"

    if [ -d "$specs_dir" ]; then
        for dir in "$specs_dir"/"$issue_num"-*; do
            if [ -d "$dir" ]; then
                echo "$(basename "$dir")"
                return 0
            fi
        done
    fi

    return 1
}

# Function to check if a branch with the same issue number already exists
check_branch_exists() {
    local issue_num="$1"

    # Check local and remote branches for pattern: <type>/#<issue_num>-*
    branches=$(git branch -a 2>/dev/null || echo "")

    if [ -n "$branches" ]; then
        while IFS= read -r branch; do
            clean_branch=$(echo "$branch" | sed 's/^[* ]*//; s|^remotes/[^/]*/||')
            if echo "$clean_branch" | grep -qE "^(feat|fix|hotfix|docs|refactor|chore)/#${issue_num}-"; then
                echo "$clean_branch"
                return 0
            fi
        done <<< "$branches"
    fi

    return 1
}

# Function to clean and format a branch name
clean_branch_name() {
    local name="$1"
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//'
}

# Resolve repository root. Prefer git information when available, but fall back
# to searching for repository markers so the workflow still functions in repositories that
# were initialised with --no-git.
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
    HAS_GIT=true
else
    REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"
    if [ -z "$REPO_ROOT" ]; then
        echo "Error: Could not determine repository root. Please run this script from within the repository." >&2
        exit 1
    fi
    HAS_GIT=false
fi

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Function to generate branch name with stop word filtering and length filtering
generate_branch_name() {
    local description="$1"
    
    # Common stop words to filter out
    local stop_words="^(i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set)$"
    
    # Convert to lowercase and split into words
    local clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/ /g')
    
    # Filter words: remove stop words and words shorter than 3 chars (unless they're uppercase acronyms in original)
    local meaningful_words=()
    for word in $clean_name; do
        # Skip empty words
        [ -z "$word" ] && continue
        
        # Keep words that are NOT stop words AND (length >= 3 OR are potential acronyms)
        if ! echo "$word" | grep -qiE "$stop_words"; then
            if [ ${#word} -ge 3 ]; then
                meaningful_words+=("$word")
            elif echo "$description" | grep -q "\b${word^^}\b"; then
                # Keep short words if they appear as uppercase in original (likely acronyms)
                meaningful_words+=("$word")
            fi
        fi
    done
    
    # If we have meaningful words, use first 3-4 of them
    if [ ${#meaningful_words[@]} -gt 0 ]; then
        local max_words=3
        if [ ${#meaningful_words[@]} -eq 4 ]; then max_words=4; fi
        
        local result=""
        local count=0
        for word in "${meaningful_words[@]}"; do
            if [ $count -ge $max_words ]; then break; fi
            if [ -n "$result" ]; then result="$result-"; fi
            result="$result$word"
            count=$((count + 1))
        done
        echo "$result"
    else
        # Fallback to original logic if no meaningful words found
        local cleaned=$(clean_branch_name "$description")
        echo "$cleaned" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//'
    fi
}

# Generate branch short description
if [ -n "$SHORT_NAME" ]; then
    # Use provided short name, just clean it up
    SHORT_DESC=$(clean_branch_name "$SHORT_NAME")
else
    # Generate from description with smart filtering
    SHORT_DESC=$(generate_branch_name "$FEATURE_DESCRIPTION")
fi

# Check for existing branches/specs with this issue number
if [ "$HAS_GIT" = true ]; then
    git fetch --all --prune 2>/dev/null || true
    EXISTING_BRANCH=$(check_branch_exists "$ISSUE_NUMBER")
    if [ -n "$EXISTING_BRANCH" ]; then
        >&2 echo "[specify] Warning: Branch already exists for issue #$ISSUE_NUMBER: $EXISTING_BRANCH"
        >&2 echo "[specify] Consider using an existing branch or a different issue number."
    fi
fi

EXISTING_SPEC=$(check_issue_exists "$SPECS_DIR" "$ISSUE_NUMBER")
if [ -n "$EXISTING_SPEC" ]; then
    >&2 echo "[specify] Note: Spec directory already exists for issue #$ISSUE_NUMBER: $EXISTING_SPEC"
    >&2 echo "[specify] Will reuse existing spec directory."
fi

# Build branch name following CONTRIBUTING.md convention: <type>/#<issue-number>-<short-description>
BRANCH_NAME="${BRANCH_TYPE}/#${ISSUE_NUMBER}-${SHORT_DESC}"

# GitHub enforces a 244-byte limit on branch names
MAX_BRANCH_LENGTH=244
if [ ${#BRANCH_NAME} -gt $MAX_BRANCH_LENGTH ]; then
    # Calculate max short desc length
    # Account for: type (max 7 "refactor") + "/#" (2) + issue number + "-" (1)
    PREFIX_LENGTH=$((${#BRANCH_TYPE} + 2 + ${#ISSUE_NUMBER} + 1))
    MAX_DESC_LENGTH=$((MAX_BRANCH_LENGTH - PREFIX_LENGTH))

    # Truncate short description
    TRUNCATED_DESC=$(echo "$SHORT_DESC" | cut -c1-$MAX_DESC_LENGTH)
    TRUNCATED_DESC=$(echo "$TRUNCATED_DESC" | sed 's/-$//')

    ORIGINAL_BRANCH_NAME="$BRANCH_NAME"
    BRANCH_NAME="${BRANCH_TYPE}/#${ISSUE_NUMBER}-${TRUNCATED_DESC}"

    >&2 echo "[specify] Warning: Branch name exceeded GitHub's 244-byte limit"
    >&2 echo "[specify] Original: $ORIGINAL_BRANCH_NAME (${#ORIGINAL_BRANCH_NAME} bytes)"
    >&2 echo "[specify] Truncated to: $BRANCH_NAME (${#BRANCH_NAME} bytes)"
fi

if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[specify] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

# Spec directory uses issue number + short description (without type prefix)
SPEC_DIR_NAME="${ISSUE_NUMBER}-${SHORT_DESC}"
FEATURE_DIR="$SPECS_DIR/$SPEC_DIR_NAME"
mkdir -p "$FEATURE_DIR"

TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
SPEC_FILE="$FEATURE_DIR/spec.md"
if [ -f "$TEMPLATE" ]; then cp "$TEMPLATE" "$SPEC_FILE"; else touch "$SPEC_FILE"; fi

# Set the SPECIFY_FEATURE environment variable for the current session
export SPECIFY_FEATURE="$BRANCH_NAME"

if $JSON_MODE; then
    printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","ISSUE_NUMBER":"%s","BRANCH_TYPE":"%s"}\n' \
        "$BRANCH_NAME" "$SPEC_FILE" "$ISSUE_NUMBER" "$BRANCH_TYPE"
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "ISSUE_NUMBER: $ISSUE_NUMBER"
    echo "BRANCH_TYPE: $BRANCH_TYPE"
    echo "SPECIFY_FEATURE environment variable set to: $BRANCH_NAME"
fi
