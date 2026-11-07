---
title: "Naive vs optimal: four problems, two ways"
editorial: true
ported_from: "Arthur Bernier Jr's original browser demo (algo-explanation, src/index.js)"
license: "Arthur Bernier Jr"
---

Four classic problems, each solved twice: once the way you first think of it, once the way you want to say it in an interview. The prompts and the test cases are the originals from Arthur's browser demo; only the DOM output lines were replaced with asserts so the file can run here.

## same / goodSame — frequency counter

> Write a function called same, which accepts two arrays. The function should return true if every value in the array has its corresponding value squared in the second array. The frequency of values must be the same.

### Naive · O(n²)

```js
function same(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    let correctIndex = arr2.indexOf(arr1[i] ** 2);
    if (correctIndex === -1) {
      return false;
    }
    arr2.splice(correctIndex, 1);
  }
  return true;
}
```

### Optimal · O(n)

```js
function goodSame(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const fc1 = arr1.reduce((acc, item, idx) => {
    if (acc[item]) {
      acc[item]++;
    } else {
      acc[item] = 1;
    }
    return acc;
  }, {});
  const fc2 = arr2.reduce((acc, item, idx) => {
    if (acc[item]) {
      acc[item]++;
    } else {
      acc[item] = 1;
    }
    return acc;
  }, {});

  for (const key in fc1) {
    if (fc1[key] !== fc2[parseInt(key, 10) ** 2]) {
      return false;
    }
  }
  return true;
}
```

### Tests

```js
same([1, 2, 3], [4, 1, 9]) === true
same([1, 2, 3], [1, 9]) === false
same([1, 2, 1], [4, 4, 1]) === false
```

**Why it is faster:** `indexOf` inside the loop rescans the second array every time, so the work is n × n. Counting each array once into a frequency object makes every lookup O(1), so the work is two passes.

## sumZero / goodSumZero — multiple pointers

> Write a function called sumZero which accepts a sorted array of integers. The function should find the first pair where the sum is 0. Return an array that includes both values that sum to zero or undefined if a pair does not exist

### Naive · O(n²)

```js
function sumZero(arr) {
  if (arr.length <= 1) {
    return undefined;
  }
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === 0) {
        return [arr[i], arr[j]];
      }
    }
  }
}
```

### Optimal · O(n)

```js
function goodSumZero(arr) {
  if (arr.length <= 1) {
    return undefined;
  }
  let left = 0,
    right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === 0) {
      return [arr[left], arr[right]];
    } else if (sum > 0) {
      right--;
    } else {
      left++;
    }
  }
}
```

### Tests

```js
Array.isArray(sumZero([-3, -2, -1, 0, 1, 2, 3])) === true
sumZero([-3, -2, -1, 0, 1, 2, 3])[0] === -3
sumZero([-3, -2, -1, 0, 1, 2, 3])[1] === 3
!sumZero([1, 2, 3], [1, 9]) === true
!sumZero([1, 2, 1], [4, 4, 1]) === true
```

**Why it is faster:** the array is sorted, so a pointer at each end can decide which side to move from the sign of the sum. Every step retires one element; the nested loop retires none.

## maxSubarraySum / goodMaxSubarraySum — sliding window

> Write a function called maxSubarraySum which accepts an array of integers and a number called n. The function should calculate the maximum sum of n consecutive elements in the array

### Naive · O(n · k)

```js
function maxSubarraySum(arr, num) {
  if (num > arr.length) {
    return null;
  }
  let max = -Infinity;
  for (let i = 0; i < arr.length - num + 1; i++) {
    let temp = 0;
    for (let j = 0; j < num; j++) {
      temp += arr[i + j];
    }
    if (temp > max) {
      max = temp;
    }
  }
  return max;
}
```

### Optimal · O(n)

```js
function goodMaxSubarraySum(arr, num) {
  let maxSum = 0;
  let tempSum = 0;
  if (arr.length < num) return null;
  for (let i = 0; i < num; i++) {
    maxSum += arr[i];
  }
  tempSum = maxSum;
  for (let i = num; i < arr.length; i++) {
    tempSum = tempSum - arr[i - num] + arr[i];
    maxSum = Math.max(maxSum, tempSum);
  }
  return maxSum;
}
```

### Tests

```js
maxSubarraySum([1, 2, 5, 2, 8, 1, 5], 2) === 10
maxSubarraySum([1, 2, 5, 2, 8, 1, 5], 4) === 17
maxSubarraySum([4, 2, 1, 6], 1) === 6
maxSubarraySum([4, 2, 1, 6, 2], 4) === 13
!maxSubarraySum([], 4) === true
```

**Why it is faster:** instead of re-adding `num` elements for every start index, the window slides: subtract the element leaving on the left, add the element entering on the right. One pass, constant work per step.

## search / goodSearch — binary search

> Given a sorted array of integers, write a function called search, that accepts a value and returns the index where the value passed to the function is located. If the value is not found, return -1

### Naive · O(n)

```js
function search(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      return i;
    }
  }
  return -1;
}
```

### Optimal · O(log n)

```js
function goodSearch(array, val) {
  let min = 0;
  let max = array.length - 1;

  while (min <= max) {
    let middle = Math.floor((min + max) / 2);

    if (array[middle] < val) {
      min = middle + 1;
    } else if (array[middle] > val) {
      max = middle - 1;
    } else {
      return middle;
    }
  }

  return -1;
}
```

### Tests

```js
search([1, 2, 3, 4, 5, 6], 4) === 3
search([1, 2, 3, 4, 5, 6], 6) === 5
search([1, 2, 3, 4, 5, 6], 11) === -1
```

**Why it is faster:** a sorted array lets you throw away half of what is left on every comparison. Six elements take at most three looks; a million take about twenty.
