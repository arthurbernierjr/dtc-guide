---
title: "The Save Crystal: Remembering a Lesson with localStorage"
lede: "A five-minute side quest: build a save point without a login, learn what the browser remembers, and find out why a bookmark is not a user account."
verified: 2026-11-07
exec: n/a
---

# The Save Crystal: Remembering a Lesson with localStorage

You reach the guild library with a notebook full of spells and exactly enough energy for one more paragraph. The librarian offers you a save crystal. It does not finish your quest. It does not remember your character on every device in the kingdom. It remembers one thing: **which lesson you chose to return to, in this browser.**

That is what the real **Save my place** button on this site does. Reading another lesson does not move your bookmark. You decide when to replace it.

## Touch the crystal first

Open [lesson 1.1](/path/1-1-welcome-to-the-new-world/). Near the start of the lesson, press **Save my place**. Read the confirmation, then return to the [homepage](/). The card now says **Your save point** and offers **Resume lesson**.

Reload the homepage. The bookmark survives. Open a different lesson without saving: your bookmark still points to 1.1. Save that other lesson and it replaces the old bookmark. Press **Clear save point** to remove it; the homepage returns to the first lesson.

You have just tested the important promise: this is an explicit bookmark, not a claim that you completed anything.

## A drawer inside the browser

`localStorage` is a small key-and-value store provided by the browser. Think of a drawer labelled with the site's address. A key names an item in the drawer; its value is text.

This site's key is `dtc:save-point:v1`. Its value looks like this:

```json
{
  "version": 1,
  "lessonId": "1.1",
  "savedAt": "2026-11-07T18:30:00.000Z"
}
```

`lessonId` identifies a published curriculum lesson. `savedAt` records when you pressed Save. `version` tells the reader which data format to expect. There is no name, email address, password, score, or copy of your code in that record.

The browser keeps the drawer on this browser profile. Our save feature does not upload its contents. The site's own JavaScript can read it, which is why it belongs in the category “useful preference,” not “secret vault.”

## Writing the bookmark

Here is the essential operation behind the button:

```js
const SAVE_KEY = 'dtc:save-point:v1';

const save = {
  version: 1,
  lessonId: '1.1',
  savedAt: new Date().toISOString(),
};

try {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  // Only now tell the reader that saving succeeded.
} catch {
  // Show: Could not save. Browser storage may be blocked or full.
}
```

JavaScript's object is not itself the stored value. `JSON.stringify` turns it into text. Without that conversion, saving a plain object gives you an unhelpful string such as `[object Object]`.

`setItem` replaces the previous value under the same key. That is why one Save button can move your bookmark without leaving a trail of old saved lessons. The `try` and `catch` matter: storage can be unavailable. A success message before the write would be a promise the interface has not earned.

## Reading is not the same as trusting

On a later visit, the site reads the text and turns it back into an object:

```js
const raw = localStorage.getItem('dtc:save-point:v1');
const saved = raw === null ? null : JSON.parse(raw);
```

Those two lines demonstrate the conversion, but they are not enough for the real interface. `getItem` can fail if storage is blocked, and `JSON.parse` can fail if the text is broken. Someone can also edit browser storage in developer tools.

The actual reader catches those failures and checks the record's version, lesson ID, and date. It looks up the ID in the site's list of published lessons. **It does not trust a stored URL.** The lesson's real title, link, and unit come from that published list. A missing, damaged, or unknown bookmark therefore cannot send you to an arbitrary website.

Once a valid lesson is found, the homepage fills its card with that lesson. With no valid save, the card invites you to begin at 1.1. This is display logic, not authentication: nothing about this bookmark proves who you are.

## Clearing one thing, not the whole drawer

The clear button does this:

```js
try {
  localStorage.removeItem('dtc:save-point:v1');
  // Refresh the card and confirm that the bookmark was cleared.
} catch {
  // Explain that the browser did not allow the removal.
}
```

Notice that we use `removeItem`, not `localStorage.clear()`. Clearing the whole store would also erase this site's unrelated preferences, such as which exercise solutions you revealed. A button labelled “Clear save point” should remove only the save point.

The page that performs the action updates its own interface immediately. Other open tabs on the same site receive a `storage` event and refresh their cards too. Returning through the browser's Back button also refreshes the displayed save.

## Where the crystal's magic ends

A bookmark on your laptop does not appear on your phone. A different browser or browser profile has a different drawer. The site's protocol, hostname, and port also matter: a save on `http://localhost:31803` is not a save on the public HTTPS website.

A shared browser profile shares this bookmark; the site cannot distinguish two people using it. Private browsing typically discards its storage when that private session ends. Clearing site data, changing browser settings, or browser cleanup can remove a save. This is convenient persistence, not a backup service.

The practice sandboxes deliberately cannot access the site's storage. Use the actual Save and Clear controls for this experiment. The code above explains the page feature; it is not a reason to loosen the sandbox protections around runnable examples.

## Your five-minute quest

Save lesson 1.1, open a second tab to the homepage, then save a later lesson in the first tab. Watch the homepage card change. Clear the save in either tab and check both. Finally, visit a lesson without pressing Save and confirm that merely reading it does not create a bookmark.

You have now separated three ideas that often get tangled together: **remembering a preference**, **tracking completion**, and **identifying a user**. This feature does the first. A real account and synchronized progress would require a different system.

For the browser's rules, see [MDN's localStorage reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and [the storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event). The site's [privacy and storage notice](/privacy/) describes the data we actually keep.
