#!/usr/bin/env bash
# The argument contract of scripts/deploy-commit.sh (Codex review of 6de12d2): a fake `node` on PATH records the fixed CLI after the real profile check, before it would
# have reached wrangler, so the accepted forms can be checked and every refused form shown to stop before wrangler.
# Run from the repository root:  bash scripts/tests/deploy-commit.test.sh
set -u
cd "$(dirname "$0")/../.."
here="$(pwd -P)"
fake="$(mktemp -d)"
# The same guard as the script under test: only ever remove a directory we just made inside the temp base.
base="$(cd "${TMPDIR:-/tmp}" && pwd -P)"
fake="$(cd "$fake" && pwd -P)"
case "$fake" in
  "$base"/tmp.*) ;;
  *) echo "refusing: temp dir $fake is not inside $base" >&2; exit 1 ;;
esac
trap 'rm -rf -- "$fake"' EXIT
export REAL_NODE="$(command -v node)"
cat > "$fake/node" <<'EOF'
#!/usr/bin/env bash
if [ -n "${FAKE_CALLER_ROOT_OVERRIDE:-}" ]; then
  case "${1:-}" in
    */check-deploy-toolchain.cjs|*/check-shared-member230-deploy.cjs)
      args=("$@"); args[2]="$FAKE_CALLER_ROOT_OVERRIDE"; exec "$REAL_NODE" "${args[@]}" ;;
  esac
fi
case "${1:-}" in *wrangler-dist*cli.js) shift ;; *) exec "$REAL_NODE" "$@" ;; esac
printf '%s\n' "--no-install wrangler $*" >> "$FAKE_LOG"
printf '%s\n' "$@" > "$FAKE_ARGV"
for (( i=1; i<=$#; i++ )); do
  if [ "${!i}" = --config ]; then
    i=$((i + 1)); cp -- "${!i}" "$FAKE_CONFIG"; break
  fi
done
exit 0
EOF
chmod +x "$fake/node"
export FAKE_LOG="$fake/calls.log"
export FAKE_ARGV="$fake/argv.log"
export FAKE_CONFIG="$fake/exported-config.toml"
export PATH="$fake:$PATH"
ok=0; n=0
check() { n=$((n + 1)); if [ "$2" -eq 0 ]; then ok=$((ok + 1)); echo "PASS $1"; else echo "FAIL $1"; fi; }
calls() { [ -f "$FAKE_LOG" ] && wc -l < "$FAKE_LOG" || echo 0; }
run() { : > "$FAKE_LOG"; env -u CLOUDFLARE_ENV -u WRANGLER_ENV bash scripts/deploy-commit.sh "$@" > "$fake/out" 2> "$fake/err"; echo $?; }
sha="$(git rev-parse HEAD)"
tree="$(git rev-parse HEAD^{tree})"
bundle="$(printf 'a%.0s' {1..64})"

rc="$(run HEAD --dry-run)"
check "HEAD --dry-run is accepted and reaches wrangler once" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && echo 0 || echo 1)
check "  with deploy --config <export>/worker/wrangler.toml --dry-run and nothing else" $(grep -Eq '^--no-install wrangler deploy --config .*/worker/wrangler\.toml --dry-run$' "$FAKE_LOG" && echo 0 || echo 1)
check "  and names the exact SHA" $(grep -q "Deploying commit $sha" "$fake/out" && echo 0 || echo 1)

# An actual accepted older Git snapshot, not a synthetic copy of the current scripts.
rollback="fb0c0ccf629d65d932365685eb13346e45b57eee"
rc="$(run "$rollback" --dry-run --keep-vars)"
git show "$rollback:worker/wrangler.toml" > "$fake/rollback.toml"
check "accepted .216 rollback predating the profile reaches the fixed CLI once with its exact archived config" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && cmp -s "$fake/rollback.toml" "$FAKE_CONFIG" && grep -q "Deploying commit $rollback" "$fake/out" && echo 0 || echo 1)

rc="$(run HEAD --dry-run --outdir "$fake/bundle")"
check "--outdir <dir> after --dry-run is passed on" $([ "$rc" -eq 0 ] && grep -Eq -- "--dry-run --outdir $fake/bundle\$" "$FAKE_LOG" && echo 0 || echo 1)
rc="$(run HEAD --dry-run --keep-vars)"
check "main --keep-vars is accepted once and preserves the exact archive selector" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && [ "$(grep -c '^--keep-vars$' "$FAKE_ARGV")" -eq 1 ] && grep -Fq '/worker/wrangler.toml' "$FAKE_ARGV" && echo 0 || echo 1)
rc="$(run HEAD --keep-vars --target main --dry-run --tag "$tree" --message "$bundle" --bind-source-tree)"
check "main keep-vars composes with its exact tree annotations and derived serving binding" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && [ "$(grep -c '^--keep-vars$' "$FAKE_ARGV")" -eq 1 ] && grep -Fxq "PRIVACY_SERVING_SOURCE_TREE:$tree" "$FAKE_ARGV" && echo 0 || echo 1)
for bad in '--keep-vars --keep-vars' '--keep-vars=true' '--target privacy-floor --keep-vars' '--keep-vars --target privacy-operator' '--target privacy-successor --keep-vars'; do
  # Deliberate token lists, never evaluated as shell code.
  # shellcheck disable=SC2086
  rc="$(run HEAD --dry-run $bad)"
  check "'$bad' is refused before wrangler runs" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q refusing "$fake/err" && echo 0 || echo 1)
done
rc="$(run HEAD --outdir="$fake/bundle" --dry-run)"
check "--outdir=<dir> works too, in either order" $([ "$rc" -eq 0 ] && grep -Eq -- "--dry-run --outdir $fake/bundle\$" "$FAKE_LOG" && echo 0 || echo 1)

for bad in "--config other.toml" "--config=other.toml" "-c other.toml" "--name other" "--name=other" "--env privatetest" "--env=privatetest" "-e privatetest" "--minify" "extra"; do
  # shellcheck disable=SC2086
  rc="$(run HEAD --dry-run $bad)"
  check "'$bad' is refused before wrangler runs" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q refusing "$fake/err" && echo 0 || echo 1)
done
rc="$(run HEAD --outdir "$fake/bundle")"
check "--outdir without --dry-run is refused" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(run HEAD --dry-run --outdir)"
check "--outdir without a directory is refused" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(run)"
check "no commit is a usage error" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(run --dry-run)"
check "an option where the commit should be is a usage error" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(run no-such-commit --dry-run)"
check "an unknown commit is refused by git before anything is exported" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
: > "$FAKE_LOG"; CLOUDFLARE_ENV=privatetest bash scripts/deploy-commit.sh HEAD --dry-run > "$fake/out" 2> "$fake/err"; rc=$?
check "CLOUDFLARE_ENV in the environment is refused" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q CLOUDFLARE_ENV "$fake/err" && echo 0 || echo 1)
: > "$FAKE_LOG"; WRANGLER_ENV=privatetest bash scripts/deploy-commit.sh HEAD --dry-run > "$fake/out" 2> "$fake/err"; rc=$?
check "WRANGLER_ENV in the environment is refused" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q WRANGLER_ENV "$fake/err" && echo 0 || echo 1)

for spec in 'main:wrangler.toml' 'privacy-floor:wrangler.privacy-floor.private.toml' 'privacy-evidence:wrangler.privacy-release-evidence.private.toml' 'privacy-initializer:wrangler.privacy-initializer.private.toml' 'privacy-operator:wrangler.privacy-operator.private.toml' 'privacy-successor:wrangler.privacy-successor.private.toml'; do
  target="${spec%%:*}"; config="${spec#*:}"
  rc="$(run HEAD --dry-run --target "$target")"
  git show "HEAD:worker/$config" > "$fake/expected.toml"
  check "$target selects exactly its archived configuration" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && grep -Fq "/worker/$config" "$FAKE_ARGV" && cmp -s "$fake/expected.toml" "$FAKE_CONFIG" && echo 0 || echo 1)
done

rc="$(run HEAD --dry-run --tag "$tree" --message "$bundle")"
check "exact tree and bundle annotation pair reaches wrangler" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && grep -Fq -- "--tag $tree --message $bundle" "$FAKE_LOG" && echo 0 || echo 1)
rc="$(run HEAD --message "$bundle" --bind-source-tree --tag "$tree" --dry-run)"
check "main derives only the serving source tree, in either argument order" $([ "$rc" -eq 0 ] && grep -Fxq "PRIVACY_SERVING_SOURCE_TREE:$tree" "$FAKE_ARGV" && [ "$(grep -c '^--var$' "$FAKE_ARGV")" -eq 1 ] && echo 0 || echo 1)
for target in privacy-initializer privacy-operator; do
  rc="$(run HEAD --dry-run --target "$target" --bind-source-tree)"
  check "$target derives only its control source tree" $([ "$rc" -eq 0 ] && grep -Fxq "PRIVACY_CONTROL_SOURCE_TREE:$tree" "$FAKE_ARGV" && [ "$(grep -c '^--var$' "$FAKE_ARGV")" -eq 1 ] && echo 0 || echo 1)
done
rc="$(run HEAD --dry-run --target privacy-successor --bind-source-tree)"
check "privacy-successor derives only its successor control source tree" $([ "$rc" -eq 0 ] && grep -Fxq "PRIVACY_SUCCESSOR_CONTROL_SOURCE_TREE:$tree" "$FAKE_ARGV" && [ "$(grep -c '^--var$' "$FAKE_ARGV")" -eq 1 ] && echo 0 || echo 1)

for bad in '--target' '--target unknown' '--target ../wrangler.toml' '--target main --target main' '--tag' '--tag abc' '--message' '--message abc' "--tag $tree" "--message $bundle" "--tag $(printf '0%.0s' {1..40}) --message $bundle" "--tag $tree --tag $tree --message $bundle" "--tag $tree --message $bundle --message $bundle" '--bind-source-tree' '--target privacy-floor --bind-source-tree' '--target privacy-evidence --bind-source-tree' '--target privacy-initializer --bind-source-tree --bind-source-tree' "--tag $tree --message $bundle --var DISCORD_BOT_TOKEN:other"; do
  # Each case is a deliberate token list, not shell code. No eval or provider invocation.
  # shellcheck disable=SC2086
  rc="$(run HEAD --dry-run $bad)"
  check "'$bad' is refused before wrangler runs" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q refusing "$fake/err" && echo 0 || echo 1)
done

# New Build230 form is exercised from a genuine small Git archive of the actual
# edited source/parser/checker. The physical toolchain check remains real; only
# its caller-root path is redirected to this qualified ordinary installed tree.
# No product commit/checkout movement, dependency install or provider invocation.
candidate="$fake/shared230"
mkdir -p "$candidate/scripts" "$candidate/worker/src"
printf '* -text\n' > "$candidate/.gitattributes"
for file in scripts/deploy-commit.sh scripts/check-deploy-toolchain.cjs scripts/deploy-toolchain-profile.json scripts/check-shared-member230-deploy.cjs worker/wrangler.toml worker/package-lock.json worker/src/shared-membership-cutover230.ts worker/src/privacy-shared-member-recovery230.ts; do
  cp -- "$here/$file" "$candidate/$file"
done
git init -q --initial-branch=fixture "$candidate"
git -C "$candidate" -c core.autocrlf=false add .
git -C "$candidate" -c user.name='Synthetic deployment fixture' -c user.email='fixture@invalid' -c commit.gpgsign=false commit -qm 'Synthetic archive for bounded deploy contract'
candidate_sha="$(git -C "$candidate" rev-parse HEAD)"
candidate_tree="$(git -C "$candidate" rev-parse HEAD^{tree})"
candidate_run() { : > "$FAKE_LOG"; env -u CLOUDFLARE_ENV -u WRANGLER_ENV FAKE_CALLER_ROOT_OVERRIDE="$here" bash "$candidate/scripts/deploy-commit.sh" "$candidate_sha" "$@" > "$fake/out" 2> "$fake/err"; echo $?; }
closure="$fake/closure.json"
node - "$candidate_sha" "$candidate_tree" "$bundle" "$closure" <<'NODE'
const fs=require('node:fs');const [commit,tree,bundle,file]=process.argv.slice(2),at=Math.floor(Date.now()/1000)-1;
fs.writeFileSync(file,JSON.stringify({version:1,contract:'olympus-shared-member-230-v1',operationId:'c'.repeat(32),priorEpoch:'a'.repeat(32),writeEpoch:'b'.repeat(32),sourceCommit:commit,sourceTree:tree,bundleSHA256:bundle,providerA:'11111111-2222-4333-8444-555555555555',writerCoverageSHA256:'1'.repeat(64),debtPredicateSHA256:'2'.repeat(64),createdAt:at,expiresAt:at+300}),{flag:'wx'});
NODE
rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode close-only)"
check "Build230 A close-only emits only fixed MODE, preserving Eold and dormant bindings" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && [ "$(grep -c '^--var$' "$FAKE_ARGV")" -eq 1 ] && grep -Fxq 'SHARED_MEMBERSHIP230_MODE:close-only' "$FAKE_ARGV" && ! grep -q 'PRIVACY_SERVING_SOURCE_TREE:' "$FAKE_ARGV" && echo 0 || echo 1)
for mode in enabled close-only; do
  rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode "$mode" --shared-member230-closure "$closure")"
  check "Build230 $mode exact closure emits only four fixed bindings" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && [ "$(grep -c '^--var$' "$FAKE_ARGV")" -eq 4 ] && grep -Fxq "SHARED_MEMBERSHIP230_MODE:$mode" "$FAKE_ARGV" && grep -Fxq "SHARED_MEMBERSHIP230_CLOSURE_JSON:$(cat "$closure")" "$FAKE_ARGV" && grep -Fxq "PRIVACY_WRITE_ADMISSION_EPOCH:$(printf 'b%.0s' {1..32})" "$FAKE_ARGV" && ! grep -q 'PRIVACY_SERVING_SOURCE_TREE:' "$FAKE_ARGV" && echo 0 || echo 1)
done
for bad in '--shared-member230-mode' '--shared-member230-mode off' '--shared-member230-mode arbitrary' '--shared-member230-mode close-only --shared-member230-mode close-only' '--shared-member230-mode enabled' '--shared-member230-closure' '--shared-member230-closure arbitrary' '--shared-member230-mode close-only --bind-source-tree' '--shared-member230-mode close-only --target privacy-floor' '--shared-member230-mode close-only --target privacy-operator' '--shared-member230-mode close-only --var OTHER:value'; do
  # Fixed deliberate token lists, no eval.
  # shellcheck disable=SC2086
  rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" $bad)"
  check "new variant '$bad' stops before Wrangler" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q refusing "$fake/err" && echo 0 || echo 1)
done
rc="$(candidate_run --dry-run --tag "$candidate_tree" --message "$bundle" --shared-member230-mode close-only)"
check "new variant without keep-vars refuses" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(candidate_run --dry-run --keep-vars --shared-member230-mode close-only)"
check "new variant without exact metadata refuses" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode enabled --shared-member230-closure "$closure" --shared-member230-closure "$closure")"
check "repeated closure refuses" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode enabled --shared-member230-closure "$candidate")"
check "directory closure refuses without reading it" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
for change in sourceCommit sourceTree bundleSHA256 expired future extra-key noncanonical non-string; do
  altered="$fake/closure-$change.json"
  node - "$closure" "$altered" "$change" <<'NODE'
const fs=require('node:fs'),[input,output,change]=process.argv.slice(2),c=JSON.parse(fs.readFileSync(input,'utf8')),now=Math.floor(Date.now()/1000);let suffix='';
if(['sourceCommit','sourceTree','bundleSHA256'].includes(change))c[change]='0'.repeat(c[change].length);
if(change==='expired'){c.createdAt=now-300;c.expiresAt=now;}
if(change==='future'){c.createdAt=now+60;c.expiresAt=c.createdAt+300;}
if(change==='extra-key')c.roleId='1552077551839617104';
if(change==='noncanonical')suffix='\n';
if(change==='non-string')c.sourceCommit=[c.sourceCommit];
fs.writeFileSync(output,JSON.stringify(c)+suffix,{flag:'wx'});
NODE
  rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode enabled --shared-member230-closure "$altered")"
  check "closure $change drift refuses before Wrangler" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q refusing "$fake/err" && echo 0 || echo 1)
done

recovery="$fake/recovery.json"
node - "$candidate_sha" "$candidate_tree" "$bundle" "$recovery" <<'NODE'
const fs=require('node:fs'),[commit,tree,bundle,file]=process.argv.slice(2),at=Math.floor(Date.now()/1000)-1;
fs.writeFileSync(file,JSON.stringify({version:1,contract:'olympus-shared-member-230-off-recovery-v1',operationId:'d'.repeat(32),sourceCommit:commit,sourceTree:tree,bundleSHA256:bundle,expectedSourceTuple:JSON.stringify([1,'olympus-write-admission-epoch-2','a'.repeat(32),'closed',0,'','',7,9]),writeEpoch:'e'.repeat(32),createdAt:at,expiresAt:at+300}),{flag:'wx'});
NODE
rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode close-only --shared-member230-recovery "$recovery")"
check "OFF recovery emits exactly MODE+fresh EPOCH, preserving old closure pins" $([ "$rc" -eq 0 ] && [ "$(calls)" -eq 1 ] && [ "$(grep -c '^--var$' "$FAKE_ARGV")" -eq 2 ] && grep -Fxq 'SHARED_MEMBERSHIP230_MODE:close-only' "$FAKE_ARGV" && grep -Fxq "PRIVACY_WRITE_ADMISSION_EPOCH:$(printf 'e%.0s' {1..32})" "$FAKE_ARGV" && ! grep -q 'CLOSURE_' "$FAKE_ARGV" && echo 0 || echo 1)
rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode enabled --shared-member230-closure "$closure" --shared-member230-recovery "$recovery")"
check "recovery never combines with enabled/closure" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode close-only --shared-member230-recovery "$recovery" --shared-member230-recovery "$recovery")"
check "recovery flag cannot repeat" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && echo 0 || echo 1)
for change in sourceCommit sourceTree bundleSHA256 expired future extra-key same-epoch active-tuple; do
  altered="$fake/recovery-$change.json"
  node - "$recovery" "$altered" "$change" <<'NODE'
const fs=require('node:fs'),[input,output,change]=process.argv.slice(2),p=JSON.parse(fs.readFileSync(input,'utf8')),now=Math.floor(Date.now()/1000);
if(['sourceCommit','sourceTree','bundleSHA256'].includes(change))p[change]='0'.repeat(p[change].length);
if(change==='expired'){p.createdAt=now-300;p.expiresAt=now;}
if(change==='future'){p.createdAt=now+60;p.expiresAt=p.createdAt+300;}
if(change==='extra-key')p.mode='enabled';
if(change==='same-epoch')p.writeEpoch=JSON.parse(p.expectedSourceTuple)[2];
if(change==='active-tuple'){const t=JSON.parse(p.expectedSourceTuple);t[4]=1;p.expectedSourceTuple=JSON.stringify(t);}
fs.writeFileSync(output,JSON.stringify(p),{flag:'wx'});
NODE
  rc="$(candidate_run --dry-run --keep-vars --tag "$candidate_tree" --message "$bundle" --shared-member230-mode close-only --shared-member230-recovery "$altered")"
  check "OFF recovery $change drift refuses before Wrangler" $([ "$rc" -ne 0 ] && [ "$(calls)" -eq 0 ] && grep -q refusing "$fake/err" && echo 0 || echo 1)
done

echo
echo "$ok/$n passed"
[ "$ok" -eq "$n" ]
