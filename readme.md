# RuleBox: A Rule Engine For ColdBox Applications

**RuleBox** is a modern, intuitive, natural-language rules engine for
BoxLang and ColdBox applications, based on the great work of
[RuleBook](https://github.com/rulebook-rules/rulebook) - ported over to
BoxLang.

Tired of classes filled with if/then/else statements? Need a nice
abstraction that decouples rules from each other and lets you write them
the same way you write the rest of your BoxLang? RuleBox is right for
you. Rules are written in an expressive, dynamic Domain Specific Language
modeled closely after the
[Given-When-Then](https://martinfowler.com/bliki/GivenWhenThen.html)
methodology.

## 📖 Documentation

**Full documentation, guides, and the complete DSL reference now live
at: https://rulebox.coldbox.org**

The site covers everything: getting started, defining RuleBooks, the
`given`/`when`/`except`/`then`/`using`/`stop` DSL, facts and results, the
`Builder`, rule auditing, thread safety, error handling, and a full
worked example - versioned, so the 1.0.0 docs stay right where they were.

- [Tutorial Course](docs/course/index.md): a step-by-step course from your first rule to the Visualizer.
- [External Rules](docs/guides/external-rules.md): load rules from JSON, YAML, or a database.
- [Visualizer](docs/guides/visualizer.md): a dashboard, dry-run playground, metrics, and a live tracker.

## Requirements

- BoxLang 1.14+

The Visualizer Live Tracker needs BoxLang 1.18.0+. Older runtimes whitespace-compress server-sent events and drop the blank line that ends each event. This was fixed in boxlang-web-support for 1.18.0.

## Installation

```bash
box install rulebox
```

## License

Apache License, Version 2.0.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

----

Made with ❤️ by [Ortus Solutions, Corp](https://www.ortussolutions.com)
