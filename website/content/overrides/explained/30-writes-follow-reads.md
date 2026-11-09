---
title: "Writes follow reads"
lede: "A reply depends on the message that prompted it. Writes-follow-reads consistency protects that causal ordering as a session moves between replicas."
youtube: zTsQhodZnKY
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Writes follow reads

Sera reads a newly posted quest and writes a reply accepting it. Her next request reaches a different replica. If that replica has not yet seen the quest, accepting the reply there can produce a strange world: an answer exists before the thing it answers.

Writes-follow-reads is a session guarantee about this dependency. A write that follows a read must be ordered after the writes that the read depended on. The original [session-guarantees paper](https://www.cs.cornell.edu/courses/cs734/2000FA/cached%20papers/SessionGuaranteesPDIS_1.html) formalizes this relationship. The system needs to preserve the relevant causal history, even when requests move between copies.

## Keep the direction of the promise straight

This is different from read-your-writes. Read-your-writes concerns seeing your own completed changes when you read later. Writes-follow-reads concerns the ordering of a new change relative to information you already observed.

The distinction matters in conversations, collaborative editing, and workflows where an action is justified by a prior result. “I accepted the offer I just saw” carries a dependency that “set my preferred color to blue” may not carry in the same way.

Draw three events on paper: the original update, the read that observes it, and the new write. Then move the reader between two replicas. Identify which information must accompany the session or which replica must catch up. That tiny diagram makes the guarantee easier to remember than its name and gives [eventual consistency](/explained/eventual-consistency/) a more precise companion.

[Original episode on YouTube](https://www.youtube.com/watch?v=zTsQhodZnKY).
