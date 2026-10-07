<p align="center">
  <a href="https://rulebox.coldbox.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://rulebox.coldbox.org/assets/brand/rulebox-logo-full-dark.svg">
      <img src="https://rulebox.coldbox.org/assets/brand/rulebox-logo-full-light.svg" alt="RuleBox" width="440">
    </picture>
  </a>
</p>

# RuleBox: A Rule Engine For ColdBox & BoxLang Applications

**RuleBox** is a modern, intuitive, natural-language rules engine for
BoxLang and ColdBox applications.

Tired of classes filled with `if/then/else` statements? Need a nice
abstraction that decouples rules from each other and lets you write them the same way you write the rest of your BoxLang? RuleBox is right for
you. Rules are written in an expressive, dynamic Domain Specific Language
modeled closely after the
[Given-When-Then](https://martinfowler.com/bliki/GivenWhenThen.html)
methodology.

![RuleBox Visualizer Dashboard](https://rulebox.coldbox.org/assets/visualizer/dashboard.png)

## 🔋 Features

- Natural-language rules engine for BoxLang and ColdBox applications.
- Decouples rules from each other for better maintainability.
- Expressive, dynamic Domain Specific Language (DSL) modeled after Given-When-Then.
- Visualizer dashboard for dry-run, metrics, and live tracking.
- Supports external rules from JSON, YAML, or a database.
- Declared facts: a RuleBook can list the facts it takes, with types, defaults and descriptions, and optionally enforce them.
- Thread-safe and robust error handling.

## 📖 Documentation

**Full documentation, guides, and the complete DSL reference
at: https://rulebox.coldbox.org**

The site covers everything: getting started, defining RuleBooks, the
`given`/`when`/`except`/`then`/`using`/`stop` DSL, facts and results, the
`Builder`, rule auditing, thread safety, error handling, and a full
worked example - versioned, so the 1.0.0 docs stay right where they were.

- [Tutorial Course](docs/course/index.md): a step-by-step course from your first rule to the Visualizer.
- [Declaring Facts](docs/guides/declaring-facts.md): document the facts a RuleBook takes, and enforce them if you want.
- [External Rules](docs/guides/external-rules.md): load rules from JSON, YAML, or a database.
- [Visualizer](docs/guides/visualizer.md): a dashboard, dry-run playground, metrics, and a live tracker.

## Requirements

- BoxLang 1.18+
- ColdBox 8+
- CommandBox 7.x (`bx-cli` module for BoxLang)

## Installation

In your ColdBox application run this within the CommandBox shell:

```bash
box install rulebox
```

Optionally, if you will be using YAML rules or our SQL metrics store:

- YAML rule files: `box install bx-yaml`
- Visualizer metrics that survive a restart (`SQLiteMetricsStore`): `box install bx-sqlite`, plus a datasource

```bash
box install bx-yaml, bx-sqlite
```

Or open your `server.json` and add them in the `installScripts` section:

```json
"scripts":{
	"onServerInitialInstall":"install bx-esapi,bx-yaml,bx-sqlite --noSave"
}
```

## License

Apache License, Version 2.0.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

----

Made with ❤️ by [Ortus Solutions, Corp](https://www.ortussolutions.com).

[❤️ He is the truth and the life](https://www.bible.com/bible/59/JHN.14.6.ESV)
