---
track: "Polygot"
title: "C#(C Sharp)"
week: 1
day: 1
type: "homepage"
topics: "C Sharp"
---
## "C#"

In the files in this folder you'll find the following

- [Intro to Language](/polyglot/cs/intro)
- [OOP in Language](/polyglot/cs/oop)
- [Overview of Routing in Web Framework](/polyglot/cs/routing)
- [Overview of Models/Database in Web Framework](/polyglot/cs/models)
- [Building API in Web Framework](/polyglot/cs/api)

## Data Structures To Attempt
- Build A Linked List
- Build A Stack with a Linked List
- Build A Queue with a Linked List
- Build A Binary Search Tree
- Breadth First Search
- Depth First Search Pre-Order
- Depth First Search In-Order
- Depth First Search Post-Order

## Algo Challenges to Attempt

```js
// --- Directions
// Write a program that console logs the numbers
// from 1 to n. But for multiples of three print
// “fizz” instead of the number and for the multiples
// of five print “buzz”. For numbers which are multiples
// of both three and five print “fizzbuzz”.
// --- Example
//   fizzBuzz(5);
//   1
//   2
//   fizz
//   4
//   buzz
```


```js

// --- Directions
// Check to see if two provided strings are anagrams of eachother.
// One string is an anagram of another if it uses the same characters
// in the same quantity. Only consider characters, not spaces
// or punctuation.  Consider capital letters to be the same as lower case
// --- Examples
//   anagrams('rail safety', 'fairy tales') --> True
//   anagrams('RAIL! SAFETY!', 'fairy tales') --> True
//   anagrams('Hi there', 'Bye there') --> False
```

```js
// --- Directions
// Write a function that accepts a string.  The function should
// capitalize the first letter of each word in the string then
// return the capitalized string.
// --- Examples
//   capitalize('a short sentence') --> 'A Short Sentence'
//   capitalize('a lazy fox') --> 'A Lazy Fox'
//   capitalize('look, it is working!') --> 'Look, It Is Working!'
```

```js
// --- Directions
// Given an array and chunk size, divide the array into many subarrays
// where each subarray is of length size
// --- Examples
// chunk([1, 2, 3, 4], 2) --> [[ 1, 2], [3, 4]]
// chunk([1, 2, 3, 4, 5], 2) --> [[ 1, 2], [3, 4], [5]]
// chunk([1, 2, 3, 4, 5, 6, 7, 8], 3) --> [[ 1, 2, 3], [4, 5, 6], [7, 8]]
// chunk([1, 2, 3, 4, 5], 4) --> [[ 1, 2, 3, 4], [5]]
// chunk([1, 2, 3, 4, 5], 10) --> [[ 1, 2, 3, 4, 5]]
```

```js
// --- Directions
// Given a string, return true if the string is a palindrome
// or false if it is not.  Palindromes are strings that
// form the same word if it is reversed. *Do* include spaces
// and punctuation in determining if the string is a palindrome.
// --- Examples:
//   palindrome("abba") === true
//   palindrome("abcdefg") === false

// function palindrome(str) {
//   const res = str.toLowerCase();
//   return res.split('').every((char, i) => {
//     return char === res[res.length - i - 1];
//   });
// }
//console.log(palindrome('Racecar'))
```