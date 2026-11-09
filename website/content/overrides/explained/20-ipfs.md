---
title: "IPFS"
lede: "Content addressing asks for particular bytes rather than a particular server. Finding those bytes still depends on someone keeping and serving them."
youtube: AFoNvKlq7Zw
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# IPFS

An ordinary web address says where to ask. An IPFS content identifier describes content using a structure tied to cryptographic hashes. If the underlying content changes, its identity changes too. That makes it possible to verify that retrieved data matches the identifier you requested.

Picture a map of the same dungeon copied into several libraries. A location-based address names a library shelf. A content-based address identifies the particular map. Another library can supply matching content without becoming the original shelf.

## Identity, persistence, and privacy are separate promises

Knowing what you want does not guarantee that a reachable node still has it. Someone must retain the data; pinning and persistence arrangements matter. “Decentralized” is not a synonym for “stored forever.”

Nor does a content identifier make a document private. The [IPFS privacy documentation](https://docs.ipfs.tech/concepts/privacy-and-encryption/) explains that the network exposes information about content providers and that content encryption is a separate concern. A hash can help identify a file without concealing its contents from someone who retrieves it.

These distinctions make IPFS more interesting, not less. You can evaluate it as a specific answer to distribution and integrity problems. Before using it for an upload, write down who keeps the file available, who may read it, and how an updated version will be discovered. Those are the application's responsibilities around the protocol.

[Original episode on YouTube](https://www.youtube.com/watch?v=AFoNvKlq7Zw).
