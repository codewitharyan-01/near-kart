# Contributing to NearKart

Thanks for your interest in improving NearKart!

## Getting started

1. Fork / clone the repository
2. `npm install`
3. `npm run dev` — the app runs at http://localhost:3000
4. Pick an issue or suggest an improvement

## Ground rules

- Keep the four modules (Customer `/customer`, Shop `/shop`, Rider `/rider`, Admin `/admin`) in sync — they share one live order engine in `src/store/`.
- All order, rider and stock logic lives in `src/lib/algorithms.ts` and the Zustand store. Prefer extending those over duplicating logic.
- Mock data (shops, SKUs, riders) lives in `src/data/` — keep it realistic (Ahmedabad locality context).
- Match the existing code style: TypeScript strict, functional React components, Tailwind utility classes.

## Submitting changes

1. Create a branch: `git checkout -b my-feature`
2. Make your change and test it across at least two modules
3. Run `npm run lint` and `npm run build` — both must pass
4. Open a pull request describing what changed and why

## Reporting bugs

Open an issue with the module, the steps to reproduce, and expected vs actual behaviour.
