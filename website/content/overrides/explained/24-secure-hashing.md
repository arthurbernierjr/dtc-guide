---
title: "Secure hashing"
lede: "A cryptographic hash helps you compare the identity of data. It does not encrypt the data or automatically make every use of it secure."
youtube: MTjt7c8zXw0
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Secure hashing

A downloaded map arrives with a published digest. You calculate the digest of your copy and compare the two. If the trusted value and your result differ, the bytes are not the expected bytes. This is one useful application of a cryptographic hash: a compact fingerprint for a potentially large input.

The word “trusted” matters. If an attacker can replace both the file and the digest you consult, matching them does not prove who created either one. Integrity checks need an appropriate source of trust around them.

## Give each cryptographic job its own tool

Hashing, encryption, and authentication answer different questions. Encryption protects readable content using keys. A hash produces a digest. A message authentication code uses a secret to help establish authenticity and integrity between parties that share it.

Passwords introduce another constraint: guessing must be expensive. A fast general-purpose hash is attractive for checking file integrity and undesirable as the entire password-storage scheme. Password hashing uses purpose-built approaches, salts, and appropriate work parameters.

The [three-jobs explanation](/security/owasp/a04-cryptographic-failures/) helps keep those choices separate. Before selecting an algorithm, finish the sentence “I need to protect against someone who can…” The answer tells you whether you are checking changed bytes, hiding a message, verifying a sender, or resisting password guesses. Similar-looking strings can belong to very different defenses.

[Original episode on YouTube](https://www.youtube.com/watch?v=MTjt7c8zXw0).
