#!/usr/bin/env bash
# Renders every ledger row (DESIGN-REFERENCE-RESPAWN.md §R10) as PNG stills, both crops,
# into website/build/assets/diagrams/<set>/ where the site build copies them from.
#
#   bash scripts/stills.sh              # everything
#   bash scripts/stills.sh session-3-1  # one set (plus the path map, which tracks what is written)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=../website/build/assets/diagrams
ONLY=${1:-}

# Written sessions = the session markdown files that exist. The map flags the latest.
WRITTEN=$(ls ../website/content/path/sessions/*.md 2>/dev/null | sed -E 's#.*/([0-9]+)-([0-9]+)-.*#"\1.\2"#' | paste -sd, -)
WRITTEN=${WRITTEN:-}

still() { # id set file layout [extra-props-json-fragment]
  local id=$1 set=$2 file=$3 layout=$4 extra=${5:-}
  if [[ -n "$ONLY" && "$set" != "$ONLY" && "$set" != "path" ]]; then return 0; fi
  mkdir -p "$OUT/$set"
  local props="{\"layout\":\"$layout\"${extra:+,$extra}}"
  npx remotion still src/index.ts "$id" "$OUT/$set/$file-$layout.png" --props="$props" --image-format=png --log=error
  echo "  $set/$file-$layout.png"
}

echo "stills → $OUT${ONLY:+ (only $ONLY + path)}"
for layout in wide tall; do
  still PathMap path path-map "$layout" "\"written\":[${WRITTEN}]"

  # Session 3.1 · Mana Basics
  still ManaContainers session-3-1 fig1-three-containers "$layout"
  still SevenPrimitives session-3-1 fig2-seven-primitives "$layout"
  still HoistingTwoPasses session-3-1 fig3-two-passes "$layout"
  still BranchingRoad session-3-1 fig4-branching-road "$layout"
  still TwoEqualsSigns session-3-1 fig5-two-equals-signs "$layout"

  # Session 3.2 · Spell Crafting
  still FunctionsThreeWays session-3-2 fig1-three-spellings "$layout"
  still ScopeRings session-3-2 fig2-scope-rings "$layout"
  still ClosureBackpack session-3-2 fig3-backpack "$layout"
  still ComboChain session-3-2 fig4-combo-chain "$layout"
  still MissingReturn session-3-2 fig5-missing-return "$layout"

  # Session 3.4 · Objects and Orcs
  still OoHandCopied session-3-4 fig1-hand-copied "$layout"
  still OoBlueprint session-3-4 fig2-blueprint "$layout"
  still OoPrototypeChain session-3-4 fig3-prototype-chain "$layout"
  still OoThisRules session-3-4 fig4-this-loses-character "$layout"

  # Session 3.5 · Casting on the World
  still DomTree session-3-5 fig1-file-and-tree "$layout"
  still ThreeSelectors session-3-5 fig2-three-selectors "$layout"
  still FourDials session-3-5 fig3-four-dials "$layout"
  still EventBubbles session-3-5 fig4-event-delegation "$layout"
  still NullAndReload session-3-5 fig5-null-and-reload "$layout"

  # Session 3.6 · The Arena
  still GameLoop session-3-6 fig1-game-loop "$layout"
  still SingleSourceOfTruth session-3-6 fig2-single-source-of-truth "$layout"
  still FileSkeleton session-3-6 fig3-skeleton-and-order "$layout"
  still TimerLeak session-3-6 fig4-timer-leak "$layout"
  still FourArenas session-3-6 fig5-four-arenas "$layout"

  # Session 1.1 · Welcome to the New World
  still TerminalShellConsole session-1-1 fig1-terminal-shell-conversation "$layout"
  still CommandAnatomy session-1-1 fig2-command-anatomy "$layout"
  still CampTree session-1-1 fig3-camp-tree "$layout"
  still Redirects session-1-1 fig4-overwrite-vs-append "$layout"
  still KeyboardMap session-1-1 fig5-keyboard-map "$layout"

  # Session 1.2 · Your Status Screen
  still FilesystemTree session-1-2 fig1-filesystem-tree "$layout"
  still ReadingLsLa session-1-2 fig2-reading-ls-la "$layout"
  still PipesAndRedirects session-1-2 fig3-pipes-and-redirects "$layout"
  still DungeonMoves session-1-2 fig4-dungeon-moves "$layout"
  still Permissions session-1-2 fig5-permissions "$layout"
  # Session 1.3 · Save Points and Respawns
  still ThreeStates session-1-3 fig1-three-states "$layout"
  still CommitChain session-1-3 fig2-commit-chain "$layout"
  still BranchTimelines session-1-3 fig3-branch-timelines "$layout"
  still TwoMerges session-1-3 fig4-two-merges "$layout"
  still ConflictMarkers session-1-3 fig5-conflict-markers "$layout"
  # Session 1.4 · Guild Sync
  still LocalAndRemote session-1-4 fig1-local-and-remote "$layout"
  still SshHandshake session-1-4 fig2-ssh-handshake "$layout"
  still PushPullCycle session-1-4 fig3-push-pull-cycle "$layout"
  still PullRequestFlow session-1-4 fig4-pull-request-flow "$layout"
  still DotfilesAnatomy session-1-4 fig5-dotfiles-anatomy "$layout"
  # Session 2.1 · The Skeleton Frame
  still RequestCycle session-2-1 fig1-request-cycle "$layout"
  still DocumentAnatomy session-2-1 fig2-document-anatomy "$layout"
  still SemanticSkeleton session-2-1 fig3-semantic-skeleton "$layout"
  still ElementShapes session-2-1 fig4-element-shapes "$layout"
  still FormWiring session-2-1 fig5-form-wiring "$layout"
  # Session 2.2 · Armor and Cosmetics
  still RuleHomes session-2-2 fig1-rule-homes "$layout"
  still SpecificityLadder session-2-2 fig2-specificity-ladder "$layout"
  still BoxModel session-2-2 fig3-box-model "$layout"
  still SelectorMap session-2-2 fig4-selector-map "$layout"
  still CustomProperties session-2-2 fig5-custom-properties "$layout"
  # Session 2.3 · Formation Magic
  still FlexAxes session-2-3 fig1-flex-axes "$layout"
  still GridAreas session-2-3 fig2-grid-areas "$layout"
  still AutoFit session-2-3 fig3-auto-fit "$layout"
  still MobileFirst session-2-3 fig4-mobile-first "$layout"
  still GridAndFlex session-2-3 fig5-grid-and-flex "$layout"
  # Session 2.4 · Enchantments
  still TransitionTimeline session-2-4 fig1-transition "$layout"
  still TransformBox session-2-4 fig2-transform "$layout"
  still KeyframeStops session-2-4 fig3-keyframes "$layout"
  still BemCard session-2-4 fig4-bem "$layout"
  still ImageFrame session-2-4 fig5-image-frame "$layout"
done
echo "done"

# Extended curriculum uses one bundle and the existing browser.
node scripts/render-curriculum.cjs "${ONLY}"
