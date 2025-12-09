# Vercel Build Skip Configuration Guide

This document provides step-by-step instructions for configuring the build skip feature in the Vercel dashboard.

## Overview

The repository now includes a smart build skip mechanism that prevents unnecessary Vercel builds when only documentation or non-build-impacting files change. This saves CI/CD resources and speeds up the development workflow.

## How It Works

1. **Configuration File**: `vercel.json` tells Vercel to use our custom ignore script
2. **Ignore Script**: `scripts/vercel-ignore-build.sh` analyzes git diff to decide if build should run
3. **Exit Codes**:
   - Exit 0 = Skip build (docs-only changes)
   - Exit 1 = Proceed with build (code/config changes)

## Vercel Dashboard Configuration

### Option 1: Automatic Configuration via vercel.json (Recommended)

The `vercel.json` file in the repository root already configures the ignore command:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "ignoreCommand": "bash scripts/vercel-ignore-build.sh"
}
```

**Vercel will automatically use this configuration** when you deploy from the repository. No manual dashboard configuration needed!

### Option 2: Manual Configuration via Dashboard (Alternative)

If you prefer to configure it manually or need to override the `vercel.json` setting:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Git**
4. Scroll to **Ignored Build Step**
5. Enter the command:
   ```bash
   bash scripts/vercel-ignore-build.sh
   ```
6. Click **Save**

## Verifying the Configuration

### Check Build Logs

After pushing a documentation-only change:

1. Go to the Vercel Dashboard → Deployments
2. Find the commit in the list
3. Look for status "Skipped (Ignored Build Step)"
4. Click to view logs - you should see:
   ```
   ==> Vercel Build Skip Check
   Comparing [SHA] to [SHA]
   Changed files:
   docs/...
   ✓ Only documentation or non-build-impacting files changed.
   Skipping build.
   ```

### Local Testing

Test the logic locally before pushing:

```bash
# Set up test environment
export VERCEL_GIT_PREVIOUS_SHA=$(git rev-parse HEAD~1)
export VERCEL_GIT_COMMIT_SHA=$(git rev-parse HEAD)

# Run the script
bash scripts/vercel-ignore-build.sh

# Or use the pnpm script
pnpm vercel:should-skip
```

Exit code 0 = build would be skipped  
Exit code 1 = build would proceed

## Testing the Configuration

### Test 1: Documentation-Only Change

```bash
# Make a docs-only change
echo "Test update" >> docs/DEPLOYMENT.md
git add docs/DEPLOYMENT.md
git commit -m "docs: test build skip"
git push

# Expected: Build should be SKIPPED
```

### Test 2: Code Change

```bash
# Make a code change
echo "// Test" >> app/page.tsx
git add app/page.tsx
git commit -m "feat: test build trigger"
git push

# Expected: Build should PROCEED
```

### Test 3: Mixed Change

```bash
# Make both documentation and code changes
echo "Test" >> docs/DEPLOYMENT.md
echo "// Test" >> app/page.tsx
git add .
git commit -m "feat: mixed changes"
git push

# Expected: Build should PROCEED (conservative approach)
```

## Troubleshooting

### Build Skipped When It Shouldn't Be

1. Check the Vercel build logs for the "Changed files" list
2. Verify the changed files are in BUILD_PATHS in `scripts/vercel-ignore-build.sh`
3. If a new build-impacting path exists, add it to BUILD_PATHS
4. Manually trigger a deployment from the Vercel Dashboard

### Build Runs When It Should Be Skipped

1. Check if the commit includes both docs and code changes (intentional behavior)
2. Check if configuration files (eslint.config.mjs, .prettierrc) were modified (these trigger builds)
3. This is conservative behavior to avoid missing important changes

### Script Not Executing

1. Verify `vercel.json` exists in repository root
2. Check file permissions: `ls -la scripts/vercel-ignore-build.sh` (should be executable)
3. Verify no syntax errors: `bash -n scripts/vercel-ignore-build.sh`
4. Check Vercel Dashboard → Settings → Git → Ignored Build Step is set correctly

### Initial Deployment Always Builds

This is expected behavior. The first deployment of a branch has no previous commit to compare against, so it always builds. Subsequent commits will use the build skip logic.

## Advanced Usage

### Customizing Build Paths

To add or remove paths that trigger builds, edit `scripts/vercel-ignore-build.sh`:

```bash
BUILD_PATHS=(
  "app/"
  "lib/"
  # Add your custom paths here
  "my-custom-path/"
)
```

### Debugging

Add more verbose logging to the script:

```bash
# In scripts/vercel-ignore-build.sh, after line 25:
echo "Debug: All changed files:"
echo "$CHANGED_FILES"
```

### Force Build

To force a build even for docs-only changes:

1. Use an empty commit:

   ```bash
   git commit --allow-empty -m "chore: force deployment"
   git push
   ```

2. Or manually redeploy from Vercel Dashboard

## Maintenance

### When to Update BUILD_PATHS

Update `BUILD_PATHS` when you:

- Add new directories containing application code
- Add new configuration files that affect build output
- Reorganize the project structure

### Testing After Updates

Always run the test suite after modifying the script:

```bash
pnpm test:vercel-skip
```

## Support

For more information, see:

- [docs/DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [scripts/vercel-ignore-build.sh](../scripts/vercel-ignore-build.sh) - The script itself (with inline comments)
- [scripts/test-vercel-ignore-build.sh](../scripts/test-vercel-ignore-build.sh) - Test suite

## FAQ

**Q: Will this affect preview deployments?**  
A: Yes, preview deployments for PRs also use this logic. Docs-only PRs won't trigger preview builds.

**Q: Can I override the skip for a specific commit?**  
A: Yes, use `git commit --allow-empty` to force a build, or manually redeploy from the Vercel Dashboard.

**Q: What happens if the script fails?**  
A: If the script exits with an error (not 0 or 1), Vercel will proceed with the build as a safety measure.

**Q: Does this work with monorepos?**  
A: The current implementation is for single-app repos. For monorepos, consider Vercel's built-in monorepo support or adapt the script to check paths per project.

**Q: How do I temporarily disable build skipping?**  
A: Remove or comment out the `ignoreCommand` in `vercel.json` and redeploy.
