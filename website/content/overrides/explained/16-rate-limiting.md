---
title: "Rate limiting"
lede: "Rate limiting makes a scarce service shareable by deciding how much work one caller may ask it to perform within a period."
youtube: wZewmtb5JEw
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Rate limiting

A guild clerk can process only so many requests. If one person repeatedly slams the bell, everyone else loses access even when that person's individual requests are valid. A rate limit gives the clerk a rule for saying “not yet.”

The rule needs three parts: what is counted, who shares the allowance, and how time replenishes it. Ten login attempts per address in a minute is different from a monthly token budget per account. One counts requests; the other counts a resource whose cost can vary dramatically between requests.

## Fairness depends on the identity you count

An IP address may represent one person or an entire school behind a shared connection. An account identifies a signed-in user, but it does not help with anonymous login attempts. Choosing the key is therefore a product decision as well as an implementation detail.

The response should help a legitimate caller recover. A 429 and suitable retry guidance are more useful than an unexplained timeout. A client that immediately retries every refusal can otherwise make the overload worse.

[Barrier Magic](/path/10-1-barrier-magic/) gives the limit a concrete job around authentication. As you follow it, notice which routes share a counter. A registration attempt and a login attempt can draw from the same allowance if they use the same limiter instance.

[Original episode on YouTube](https://www.youtube.com/watch?v=wZewmtb5JEw).
