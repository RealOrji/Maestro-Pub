# Maestro-Pub

A clean, real-world [Maestro](https://maestro.mobile.dev) mobile UI test suite you can clone and run in minutes.

It tests the official **Wikipedia Android app** (`org.wikipedia`). It's free, public and needs no login, so anyone can run every test here without credentials or a private build. Use it as a reference, a starter template, or a way to learn how a Maestro suite is put together.

## What's covered

| Flow | Tags | What it proves |
| --- | --- | --- |
| `flows/onboarding/onboarding.yaml` | `smoke` `onboarding` | A first-time user gets through all 4 onboarding pages and lands on the home feed |
| `flows/navigation/bottom_navigation.yaml` | `smoke` `navigation` | Every bottom-nav tab (Home, Saved, Search, Activity, More) opens the right screen |
| `flows/search/search_article.yaml` | `smoke` `search` | Searching, opening a result and landing on the correct article |
| `flows/search/search_no_results.yaml` | `regression` `search` `negative` | A nonsense query shows "No results", and clearing it resets the screen |
| `flows/saved/save_article.yaml` | `regression` `saved` | Saving an article from its page and finding it in the Saved tab |

## Project layout

```
.
├── config.yaml              # Workspace config: which flows run, and in what order
├── flows/                   # Top-level tests, one user journey per file
│   ├── onboarding/
│   ├── navigation/
│   ├── search/
│   └── saved/
├── subflows/                # Reusable building blocks called with runFlow
│   ├── launch_clean.yaml        # clearState + launch
│   ├── complete_onboarding.yaml # walk the 4 onboarding pages
│   ├── fresh_start.yaml         # launch_clean + complete_onboarding
│   ├── dismiss_popups.yaml      # conditionally close feature-discovery popups
│   ├── search_for.yaml          # parameterised search (QUERY)
│   └── back_to_tabs.yaml        # press back until the bottom nav is visible
├── scripts/
│   └── random_query.js      # runScript helper that generates test data
└── .github/workflows/
    └── maestro.yml          # CI: runs the suite on an Android emulator
```

## Patterns worth stealing

- **Every test is independent.** Each flow starts with `clearState`, so tests can run in any order, alone or together, and one failure never cascades into the next.
- **Subflows for anything done twice.** Onboarding, search and popup handling live in `subflows/` and are reused with `runFlow`. If the app changes, you fix it in one place.
- **Parameterised flows.** `search_for.yaml` takes a `QUERY` param. `search_article.yaml` sets `env` defaults you can override from the CLI.
- **Conditional steps for flaky UI.** The app shows one-off popups ("A Faster way to Search", "Got it" tooltips). `dismiss_popups.yaml` uses `runFlow` + `when: visible` so tests close them when they appear and carry on when they don't.
- **Loops instead of guessing.** `back_to_tabs.yaml` uses `repeat` + `while: notVisible` instead of a hard-coded number of `back` presses.
- **Waiting on purpose.** Network-bound steps use `extendedWaitUntil` with explicit timeouts, not `sleep`.
- **Generated test data.** `search_no_results.yaml` gets its query from `runScript` (`output.query`), so it never depends on a magic string.
- **Stable selectors first.** Resource ids (`org.wikipedia:id/nav_tab_search`) where the app has them, visible text where it doesn't. Inside the article WebView, the id `pcs-edit-section-title-description` checks the right page loaded.
- **Tags.** `smoke` for a fast pre-merge check, `regression` for the full pass.

## Getting started

### 1. Install Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
maestro --version
```

Requires Java 17+. See the [install docs](https://docs.maestro.dev/getting-started/installing-maestro) for Windows/WSL.

### 2. Start an Android emulator (or plug in a device)

Any recent Android emulator works (tested on Android 14 / API 34). Check it's connected:

```bash
adb devices
```

### 3. Install the Wikipedia app

Install from the Play Store, or grab the official APK from Wikimedia:

```bash
curl -L -o wikipedia.apk \
  https://releases.wikimedia.org/mobile/android/wikipedia/stable/wikipedia-50614-r-2026-10-20.apk
adb install -r wikipedia.apk
```

> The suite was written against build `50614` (Oct 2026). Newer builds usually work, but if Wikipedia redesigns a screen, a selector may need updating.

### 4. Run it

```bash
# Everything
maestro test .

# A single flow
maestro test flows/search/search_article.yaml

# Only smoke tests
maestro test . --include-tags smoke

# Override test data from the CLI
maestro test flows/search/search_article.yaml \
  -e SEARCH_TERM=Abuja \
  -e EXPECTED_DESCRIPTION="Capital of the Federal Republic of Nigeria"

# JUnit report + screenshots/logs (what CI uses)
maestro test . --format junit --output report.xml --test-output-dir debug-output
```

To build or debug a flow interactively, run `maestro studio`.

## CI

`.github/workflows/maestro.yml` runs the whole suite on every push and pull request. It boots an API 34 emulator with [`reactivecircus/android-emulator-runner`](https://github.com/ReactiveCircus/android-emulator-runner), installs a pinned Wikipedia APK, runs Maestro and uploads the JUnit report and screenshots as build artifacts.

## Adapting this to your own app

1. Change `appId` in each flow to your app's package name (or bundle id on iOS).
2. Rewrite `subflows/launch_clean.yaml` and `subflows/complete_onboarding.yaml` for your app's first-run experience.
3. Keep the structure: journeys in `flows/`, reusable steps in `subflows/`, data helpers in `scripts/`.
4. Put credentials in `-e` CLI params or CI secrets, never in the YAML.

## Contributing

Issues and PRs are welcome, whether that's a new flow, a better pattern, or a fix when the Wikipedia app changes.

## Author

**Orji Innocent**, QA / Test Automation Engineer. [GitHub @RealOrji](https://github.com/RealOrji)

## License

[MIT](LICENSE)
