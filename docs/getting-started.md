---
title: Getting Started
order: 2
icon: phosphor-duotone:rocket-launch
summary: Install RuleBox and see what it registers in WireBox.
tags: [guides, setup]
---

# Getting Started

## Requirements

- BoxLang 1.14+

## Installation

Leverage [CommandBox](https://commandbox.ortusbooks.com/) to install
RuleBox as a module in your ColdBox application:

```bash frame="terminal" title="Terminal"
box install rulebox
```

### Optional modules

Rules written in BoxLang or JSON need nothing else. Two features rely on
official BoxLang modules that RuleBox does not install for you, so install
them only if you use them:

| Feature | Install |
|---|---|
| YAML rule files (`YAMLRuleSource`, or `.yaml`/`.yml` files in the convention folder) | `box install bx-yaml` |
| Visualizer metrics that survive a restart (`SQLiteMetricsStore`) | `box install bx-sqlite`, plus a datasource. See [Rule Visualizer](guides/visualizer.md). |

## What gets registered

Once installed, the module registers the following objects in WireBox:

| WireBox ID | Type | Description |
|---|---|---|
| `Rule@rulebox` | Transient | A single rule |
| `RuleBook@rulebox` | Transient | A rule book that groups and chains rules |
| `Builder@rulebox` | Singleton | Builds à la carte rules and rule books |
| `Result@rulebox` | Transient | Models the result produced by a rule chain |

> `RuleBook` and `Rule` are **transient** objects - they carry state
> (facts, results, audit trail) across a `run()`, so a fresh instance is
> requested every time via `getInstance()`. See
> [Thread Safety](guides/thread-safety.md) for why that matters.

## Next steps

- [Defining RuleBooks](guides/defining-rulebooks.md)
- [The RuleBook DSL](guides/the-dsl.md)
