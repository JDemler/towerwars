# Game Balancing Guide

This project ships with a few helper tools to analyse balancing.

## Quick simulation

Run the balancer command which spawns two naive agents and records the outcome to `data.csv`:

```bash
go run ./cmd/balancer
```

The generated CSV can be plotted with your favourite tool to inspect income and unit statistics over time.

## Analysing units

The analyzer prints ratios for every mob type across all network configurations:

```bash
go run ./cmd/analyzer
```

Use these numbers to compare value, difficulty and income of the different units.

Adjust the YAML files inside `cmd/server/networkconfigs` and the base configuration `cmd/server/gameConfig.json` to achieve a fair match up between networks.

