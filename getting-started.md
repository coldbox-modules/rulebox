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
