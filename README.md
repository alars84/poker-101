# Poker 101

A phone-friendly Texas Hold'em study app. Practice reading showdowns and naming hands, with extra reps on the spots that cause arguments at the table: kickers, split pots, and the board playing.

## Run it

```sh
npm install
npm run dev
```

## Check it

```sh
npm test
npm run build
npm run lint
```

## Layout

- `src/domain`: the poker rules. No React.
- `src/drills`: deals rounds, checks answers, keeps score. No React.
- `src/ui`: React components.

## License

[MIT](LICENSE)
