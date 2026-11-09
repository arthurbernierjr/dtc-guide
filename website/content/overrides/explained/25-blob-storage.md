---
title: "Blob storage"
lede: "Object storage gives large files an address and a lifetime. Your application still needs to decide who owns them and who may retrieve them."
youtube: AwOoY47ua6E
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Blob storage

A profile record and a profile photograph have different needs. The record contains fields you want to query: a name, an owner, perhaps a creation date. The image is a body of bytes you want to store and deliver. Keeping the image in object storage and its reference in the database often makes those responsibilities easier to manage.

The warehouse metaphor in this episode is useful if you remember the inventory system around the shelves. An object has a key, metadata, and access rules. A key is not necessarily a public URL, and an unguessable filename is not a complete permission system.

## Design the unfinished upload, too

Suppose the image upload succeeds but saving its database record fails. You now have an object nobody references. Reverse the order and you may have a record pointing to a missing image. Decide how the application recognizes and cleans up those incomplete states.

Deletion needs the same care. Removing a profile from the database does not automatically remove its files, cached copies, or backups. Give those lifetimes a deliberate policy.

For a first implementation, trace one file from selection to retrieval: validation, upload, stored key, authorized access, and replacement. That journey turns “put it in a bucket” into a feature a user can trust.

[Original episode on YouTube](https://www.youtube.com/watch?v=AwOoY47ua6E).
