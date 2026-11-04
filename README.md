# Poker 101

A phone-friendly Texas Hold'em study app. Practice reading showdowns and naming hands, with extra reps on the spots that cause arguments at the table: kickers, split pots, and the board playing. Then practice decisions: which starting hands to raise, what the board makes possible, whether the price is right to call, and how to read other players.

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
- `src/quizzes`: deals rounds, checks answers, keeps score. No React.
- `src/ui`: React components.

## License

[MIT](LICENSE)
