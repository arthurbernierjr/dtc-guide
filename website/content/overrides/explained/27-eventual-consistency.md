---
title: "Eventual consistency"
lede: "Replicated data can be temporarily different in different places. A useful product explains which differences are acceptable and how the user experiences them."
youtube: uyky3oRon3Y
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Eventual consistency

You change your avatar, open the guild directory on another device, and see the old picture. The update may have been accepted while another copy has not caught up yet. Eventual consistency describes a convergence promise under the system's assumptions; it does not mean every read immediately observes the newest write.

The interesting design work is deciding where temporary disagreement is tolerable. A stale avatar is usually less consequential than selling the final seat twice. Different operations in the same application may need different guarantees.

## Design the moment between versions

A user who has just saved a change needs an intelligible response. You might return the saved representation directly, keep subsequent reads on a suitable replica, or show that an update is still propagating. The choice should follow the storage system's actual guarantees.

Conflicting updates also need a rule. If two devices edit the same field while disconnected, convergence alone does not tell you which value should win or whether a person should resolve the conflict.

Try describing the experience without database vocabulary: “Your change is saved, but other members may see the previous version briefly.” If that sentence would be unacceptable for the operation, the architecture needs stronger coordination or a different interaction. The companion on [writes following reads](/explained/writes-follow-reads/) adds another question: can a later action arrive somewhere before the information it depended on?

[Original episode on YouTube](https://www.youtube.com/watch?v=uyky3oRon3Y).
