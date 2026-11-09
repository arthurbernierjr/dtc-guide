---
title: "Dynamic programming"
lede: "Dynamic programming becomes useful when several paths through a problem keep asking you to solve the same smaller problem again."
youtube: jhxx5qVHQjw
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Dynamic programming

Suppose potion ingredients cost 1, 3, or 4 coins, and you want to make an exact total using as few items as possible. For a total of 6, choosing the largest denomination first gives 4 + 1 + 1. But 3 + 3 uses fewer items. A locally attractive choice has missed the better complete answer.

Dynamic programming asks you to define smaller answers that can be reused. Let the best count for a total depend on the best counts for totals reached by removing one allowed denomination. Once a smaller total has an answer, you should not have to rediscover it along every branch.

## Define the table before filling it

The most important sentence is what each entry means. “The fewest items needed to make exactly this total” is precise. “Some progress toward the answer” is not. You also need a base case, such as zero items making a total of zero, and a way to represent impossible totals.

Memoization stores answers as recursive calls discover them. Tabulation fills them in an order that ensures dependencies are ready. Both rely on the same careful problem definition.

Work totals 0 through 6 by hand before writing the general solution. If you cannot explain why an entry uses particular earlier entries, a larger table will only hide the uncertainty. The reward comes from reusing understood work, not from introducing an array called `dp`.

[Original episode on YouTube](https://www.youtube.com/watch?v=jhxx5qVHQjw).
