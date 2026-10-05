---
title: What is RuleBox?
summary: The idea in one minute, what we will build, and how to install it.
icon: phosphor-duotone:lightbulb
tags: [course]
---

# What is RuleBox?

Business decisions tend to end up as one long method full of `if` and
`else`. Every new requirement makes it harder to read and easier to break.

RuleBox lets you write each decision as a small, **named rule** instead.
A rule reads like a sentence:

> **Given** an applicant, **when** their credit score is under 580,
> **then** the result is `DECLINED`.

## What we will build

A loan decision. We will feed it facts about an applicant and get back one
answer.

| Credit score | Amount requested | Decision |
|---|---|---|
| 540 | 100,000 | `DECLINED` |
| 720 | 100,000 | `APPROVED` |
| 720 | 900,000 | `MANUAL_REVIEW` |
| 640 | 100,000 | `MANUAL_REVIEW` |

## Four words to know

| Word | Meaning |
|---|---|
| **Fact** | A piece of data a rule can look at, like `creditScore`. |
| **Rule** | A condition (`when`) plus an action (`then`). |
| **RuleBook** | A group of rules that run in order. |
| **Result** | The answer the rules build up as they run. |

## Install

RuleBox is a ColdBox module. From your app's root folder:

```bash frame="terminal" title="Terminal"
box install rulebox
```

When your app starts, ColdBox registers these objects with WireBox:

| WireBox ID | Scope | What it is |
|---|---|---|
| `RuleBook@rulebox` | Transient | A group of rules |
| `Rule@rulebox` | Transient | A single rule |
| `Result@rulebox` | Transient | The answer being built |
| `Builder@rulebox` | Singleton | Builds rules and rulebooks on the fly |
| `RuleBookRegistry@rulebox` | Singleton | Finds the rulebooks you declare in config |

You will use `RuleBook` in the next lesson and meet the registry in lesson 7.

## Try it

Run `box install rulebox`, restart your app, and move on. There is nothing
else to configure.

Planning to keep rules in YAML files? Also run `box install bx-yaml`. RuleBox
does not install it for you. JSON and BoxLang rules need nothing extra.

**Next:** write your first rule.
