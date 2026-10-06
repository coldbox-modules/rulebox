---
title: The Visualizer
summary: Turn on the built-in admin UI to browse rules, dry-run them, and watch them live.
icon: phosphor-duotone:number-circle-nine
tags: [course]
---

# The Visualizer

So far you have inspected rules in code. RuleBox also ships a small admin
UI that shows the same things in a browser. It is **off by default**.

## Turn it on

In the same `variables.moduleSettings` from lesson 7, add a `visualizer`
block:

```js
variables.moduleSettings = {
	rulebox = {
		rulebooks = {
			"loan" : {
				"source"  : "config/rules/loan.json",
				"actions" : { "decide" : "DecisionAction" }
			}
		},
		visualizer = {
			enabled      = true,
			// This is the default store, written out so the setting is complete.
			metricsStore = "InMemoryMetricsStore@rulebox"
		}
	}
}
```

Restart your app, then open:

```
/rulebox-visualizer/visualizer/index
```

> **Lock it down.** RuleBox does not secure the Visualizer for you. Put
> `/rulebox-visualizer` behind your normal login (for example a cbSecurity
> rule) before you turn it on anywhere that is not your own machine.

## A tour

<figure class="rb-video">
<video controls preload="metadata" playsinline poster="../../assets/video/2.0.0/rulebox-visualizer-intro-poster.png" aria-label="A one-minute tour of the RuleBox Visualizer">
<source src="../../assets/video/2.0.0/rulebox-visualizer-intro.mp4" type="video/mp4">
</video>
</figure>

::: image-gallery columns="3"
::: image src="../assets/visualizer/2.0.0/dashboard.png" alt="The Dashboard: totals, Problem rules and Slowest rules panels, a table of every rulebook with its outcomes, and a recent activity feed" caption="Dashboard"
:::
::: image src="../assets/visualizer/2.0.0/chain-loanapproval.png" alt="The chain view for a rulebook, showing priority badges, a stops-chain marker and per-rule outcome counts" caption="Rule Visualizer"
:::
::: image src="../assets/visualizer/2.0.0/dryrun.png" alt="The Dry Run screen: facts as JSON on the left, which rules would execute on the right" caption="Dry Run"
:::
::: image src="../assets/visualizer/2.0.0/metrics.png" alt="The Metrics screen: evaluation count, average duration, completion and error rates, a rule health table and outcomes by state" caption="Metrics"
:::
::: image src="../assets/visualizer/2.0.0/metrics-errors.png" alt="A failing rule's errors: each distinct error once, with how many times it happened, what caused it and where it was thrown" caption="Errors and stack traces"
:::
::: image src="../assets/visualizer/2.0.0/live.png" alt="The Live Tracker: rule evaluations streaming in as they run, with a failed one opened to show why it failed" caption="Live Tracker"
:::
:::

The sidebar links the five screens.

**Dashboard.** Every rulebook you declared, with its rule count, results and
a feed of recent activity. Your `loan` rulebook is here. Above it, **Problem
rules** lists the rules that fail most and **Slowest rules** the ones that take
longest, so you know where to look first.

**Rule Visualizer.** Click **View chain** on a rulebook to see its rules in
the order they really run, with their priorities and which ones stop the
chain. This is lesson 4 as a picture.

**Dry Run.** Pick a rulebook, type facts as JSON, such as
`{ "creditScore": 640 }`, and press **Run dry run**. It is `dryRun()` from
lesson 5 with a button. Nothing is executed or recorded.

**Metrics.** Totals and averages per rulebook, gathered across every run, not
just one RuleBook instance. The **Rule health** table shows each rule's
completion rate, error rate, durations and last error. Remember lesson 8: when
a rule throws, the error still reaches your code, and the Visualizer also
records it here. Open **Show errors** to see each distinct
error once, with how many times it happened, what caused it, and where.

**Live Tracker.** Every rule evaluation, as it happens. Run your handler
from lesson 7 in another tab and watch the rows arrive. A failed evaluation
shows up in red with its error.

> The Live Tracker needs BoxLang **1.18.0 or later**. The other four screens
> work on older versions.

The screenshots above come from RuleBox's own test app, so your rulebook
names will differ.

## Try it

Enable the Visualizer, open the Dry Run screen, choose `loan`, and enter
`{ "creditScore": 540 }`. You should see `declineLowScores` would execute and
stop the chain. Then enter `{ "creditScore": 720, "requestedAmount": 100000 }`.

The [Rule Visualizer guide](../guides/visualizer.md) covers every setting,
including a SQLite store that keeps metrics across restarts.

**Next:** wrap up.
