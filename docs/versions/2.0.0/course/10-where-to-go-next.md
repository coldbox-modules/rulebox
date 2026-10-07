---
title: Where to Go Next
summary: A recap of what you built, a few habits worth keeping, and where to read more.
icon: phosphor-duotone:flag-checkered
tags: [course]
---

# Where to Go Next

You started with an `if` statement and ended with rules that live in a
file, run inside ColdBox, and show up in a browser. Here is the whole
journey in one place.

## What you learned

| Lesson | You learned to |
|---|---|
| 1 | Think in facts, rules, rulebooks and results. |
| 2 | Write a RuleBook with `newRule().when().then()` and run it. |
| 3 | Pass facts in, declare and enforce them, and read the Result with `getValue()` and `orElse()`. |
| 4 | Order and shape rules with `withPriority()`, `stop()` and `except()`. |
| 5 | See what ran with the audit trail, `dryRun()` and metrics. |
| 6 | Move rules into JSON, with named actions. |
| 7 | Declare rulebooks in config and use `ruleBook( "name" )`. |
| 8 | Handle `FAILED` rules, invalid facts and the errors RuleBox catches early. |
| 9 | Browse and test rules in the Visualizer. |

## Habits worth keeping

- **Name every rule.** Names are how you read the audit trail.
- **Describe your rulebooks and declare their facts.** It documents them
  for the next developer, and the Visualizer turns it into a form.
- **Get a fresh RuleBook for each decision.** Use `getInstance()`,
  `ruleBook( "name" )` or an injected provider, and never keep one in a
  shared variable.
- **Set a default result.** Every run then has an answer and a clean start.
- **Reach for `dryRun()` first** when someone asks "what would happen if?"
- **Put thresholds that change often in JSON,** and keep the logic that
  rarely changes in BoxLang.
- **Secure the Visualizer** before it leaves your machine.

## Keep reading

- [The RuleBook DSL](../guides/the-dsl.md) covers `using()`, time windows
  with `active()` and everything else a rule can do.
- [Declaring Facts](../guides/declaring-facts.md) covers every fact type,
  `withFacts()`, strict mode and `validateFacts()`.
- [The Builder](../guides/the-builder.md) builds rules and rulebooks on the
  fly, with no class.
- [Externalized Rule Definitions](../guides/external-rules.md) has YAML and
  database sources, plus reloading rules without a restart.
- [Thread Safety](../guides/thread-safety.md) explains why a fresh RuleBook
  matters.
- [Error Handling](../guides/error-handling.md) goes deeper on `FAILED`.
- [A Complex Example](../guides/complex-example.md) is a longer, real-world
  rulebook.
- [The Rule Visualizer](../guides/visualizer.md) lists every Visualizer
  setting.

Thanks for taking the course. If something was unclear, please tell us at
[github.com/coldbox-modules/rulebox/issues](https://github.com/coldbox-modules/rulebox/issues).
