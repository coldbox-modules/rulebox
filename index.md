---
title: Home
order: 1
icon: phosphor-duotone:brain
summary: RuleBox is a modern, intuitive, natural-language rules engine for BoxLang and ColdBox applications.
toc: false
---

# RuleBox

**RuleBox** is a modern, intuitive, natural-language rules engine for
BoxLang and ColdBox applications, based on the great work of
[RuleBook](https://github.com/rulebook-rules/rulebook) - ported over to
BoxLang.

Tired of classes filled with `if`/`then`/`else` statements? Need a nice
abstraction that decouples rules from each other and from the rest of your
code? Want to write rules the same way you write the rest of your BoxLang?
RuleBox is right for you.

RuleBox lets you write rules in an expressive, dynamic Domain Specific
Language (DSL) modeled closely after the
[Given-When-Then](https://martinfowler.com/bliki/GivenWhenThen.html)
methodology popularized by Behavior Driven Development.

::: cards
::: card title="Natural-language DSL" icon="phosphor-duotone:chat-circle-text"
Rules read like sentences: `given().when().then()`. No nested
conditionals, no scattered business logic.
:::
::: card title="WireBox-native" icon="phosphor-duotone:plugs-connected"
`Rule@rulebox`, `RuleBook@rulebox`, `Builder@rulebox` and `Result@rulebox`
are registered automatically - just `getInstance()` them.
:::
::: card title="Fully audited" icon="phosphor-duotone:list-magnifying-glass"
Every rule's execution is tracked in a `RuleStatusMap`, so you always know
which rules fired, skipped, stopped, or failed.
:::
:::

## Where to start

- [Getting Started](getting-started.md) - install the module
- [Defining RuleBooks](guides/defining-rulebooks.md) - your first rules
- [The RuleBook DSL](guides/the-dsl.md) - `given`/`when`/`except`/`then`/`using`/`stop`
- [A Complex Example](guides/complex-example.md) - a full, real-world walkthrough

## Requirements

- BoxLang 1.14+

## License

Apache License 2.0.
