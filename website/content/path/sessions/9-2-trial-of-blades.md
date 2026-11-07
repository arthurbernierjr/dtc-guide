---
editorial: true
title: Trial of Blades
subtitle: Arrays, Objects, Big O, and Core Data Structures
hook: "Typed data structures with operation tests and time/space analysis. Identify the frequent reads and writes."
read: 60
artifact: "Typed data structures with operation tests and time/space analysis"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
say:
  - "Operation: Identify the frequent reads and writes."
  - "Structure: Choose representation for those operations."
  - "Growth: Explain how time and memory scale with input."
---

## The hook

Welcome to the Trial of Blades. Every warrior needs to know their weapons. A sword is great for close combat, useless at range. A bow is great at range, slow up close. Data structures are the same way. An array is perfect for some problems and terrible for others. Today you learn which weapon to draw for which fight.

Your app stores data. How you store it determines whether your app responds in 1 millisecond or 10 seconds. At 100 users, it does not matter. At 100,000 users, it is the difference between success and a crash. When an investor asks "Can your system handle scale?" they are really asking "Do you understand data structures and performance?" After today, your answer is yes.

We are covering Big O notation, then building stacks, queues, and linked lists from scratch in TypeScript. By the end of this session, you will know the performance characteristics of every data structure you use and you will have built three of them with your own hands.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Analyze Algorithm Efficiency Using Big O Notation
You will analyze the time and space complexity of algorithms using Big O notation and select appropriate solutions based on performance requirements.

**Enabling Objectives:**
- Define Big O notation and explain what it measures (growth rate, not exact time)
- Identify the time complexity of code containing loops, nested loops, recursive calls, and divide-and-conquer patterns
- Compare common complexity classes (O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n)) and rank them by efficiency
- Analyze space complexity by tracking memory allocation relative to input size
- Evaluate algorithm tradeoffs between time complexity, space complexity, and code readability

**You should be able to:**
- Look at a function and determine its Big O time and space complexity
- Explain why an O(n) solution is preferable to an O(n^2) solution at scale
- Choose between algorithmic approaches based on performance characteristics

### Apply Core Data Structures to Solve Programming Problems
You will implement and apply stacks, queues, linked lists, hash tables, and trees to solve programming problems, selecting the appropriate data structure based on the problem's requirements.

**Enabling Objectives:**
- Implement a generic Stack class with push, pop, peek, and isEmpty operations in TypeScript
- Implement a generic Queue class with enqueue, dequeue, and front operations in TypeScript
- Build a singly linked list with append, prepend, remove, find, and reverse methods in TypeScript
- Explain how hash tables work (hashing, collisions, chaining) and use Map and Set effectively
- Describe binary tree structure, traversal orders, and when trees are used in real systems
- Apply algorithm patterns (two pointers, sliding window, frequency counter, divide and conquer) to solve problems efficiently

**You should be able to:**
- Build data structures from scratch using TypeScript generics
- Select the right data structure for a given problem based on operation complexity
- Solve algorithm problems using established patterns

**Why Data Structures Matter**

Real-world motivation: your app stores data. How you store it determines whether your app responds in 1 millisecond or 10 seconds. At 100 users, it does not matter. At 100,000 users, it is the difference between success and a crash.

The founder angle: when an investor asks "Can your system handle scale?" they are really asking "Do you understand data structures and performance?"

**Big O Notation - The Universal Language of Performance**

What is Big O? It describes how the runtime of an algorithm grows as the input grows. It is not about exact milliseconds. It is about the shape of the growth curve.

The common Big O complexities visualized:

```
Performance (time) vs Input Size (n)

         |
  Time   |  O(n!)  /
         |        /
         |  O(2^n)/
         |      /
         |  O(n^2)
         |    /
         |  O(n log n)
         |  /
         | O(n)
         |/_____________ O(log n)
         |______________ O(1)
         +----------------------------
                Input Size (n)
```

**O(1) - Constant Time:** Same speed regardless of input size.

```typescript
// O(1) examples:
function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0]; // Always one operation, no matter array size
}

function isEven(n: number): boolean {
  return n % 2 === 0; // Always one operation
}

// Accessing an object property by key
const heroData = { name: "Arthur", level: 42 };
const nameVal = heroData.name; // O(1) - direct access

// Accessing an array by index
const items = ["sword", "shield", "potion"];
const firstItem = items[0]; // O(1) - direct access
```

**O(log n) - Logarithmic Time:** Cuts the problem in half each step. Very fast.

```typescript
// O(log n) example: Binary Search
// Only works on SORTED arrays
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1; // Not found
}

// For an array of 1,000,000 items:
// Linear search: up to 1,000,000 checks
// Binary search: up to 20 checks (log2(1,000,000) ~ 20)
// That is the power of O(log n)
```

**Why founders should care: Big O is a line item on your cloud bill.** This is not academic. Every comparison your code makes costs compute, and compute costs money. Watch how the gap grows:

| Dataset Size | Linear Search (max checks) | Binary Search (max checks) |
|--------------|---------------------------|----------------------------|
| 100 | 100 | 7 |
| 1,000 | 1,000 | 10 |
| 100,000 | 100,000 | 17 |
| 10,000,000 | 10,000,000 | 24 |

Now put startup numbers on it. Say your product takes off: 500 million page views a year, each triggering 20 searches against a 230-million-record dataset, at a (realistic cloud-scale) cost of roughly $0.000000000327 per record touched:

- **Linear search:** ~115 million records touched per search on average → about **$376,000,000 per year** in compute
- **Binary search:** ~28 records touched per search (log₂ of 230M) → about **$92 per year**

Three hundred seventy-six million dollars versus ninety-two dollars, for the same feature, decided by one algorithm choice. The numbers are illustrative, but the principle is real and it is why database indexes exist (they are what lets the database binary-search instead of table-scan). When your app feels slow and your cloud bill looks scary, the first question is always: "where am I doing O(n) work that could be O(log n) or O(1)?"

**O(n) - Linear Time:** Time grows proportionally to input size.

```typescript
// O(n) examples:
function findMax(arr: number[]): number {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) { // Visits every element once
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

function sumArray(arr: number[]): number {
  let total = 0;
  for (const num of arr) { // Visits every element once
    total += num;
  }
  return total;
}

// Array.includes(), Array.indexOf(), Array.find()
// All O(n) because they might check every element
```

**O(n log n) - Linearithmic Time:** Typical of efficient sorting algorithms.

```typescript
// O(n log n) example: JavaScript's built-in sort
const numbers = [38, 27, 43, 3, 9, 82, 10];
numbers.sort((a, b) => a - b); // O(n log n)

// O(n log n) is the theoretical best for comparison-based sorting
```

**O(n^2) - Quadratic Time:** Nested loops. Gets slow fast.

```typescript
// O(n^2) example: checking for duplicates with nested loops
function hasDuplicatesSlow(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {         // n iterations
    for (let j = i + 1; j < arr.length; j++) {   // n iterations
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
// 100 items: ~5,000 comparisons
// 1,000 items: ~500,000 comparisons
// 10,000 items: ~50,000,000 comparisons

// O(n) version using a Set:
function hasDuplicatesFast(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(num)) return true;  // O(1) lookup
    seen.add(num);                    // O(1) insert
  }
  return false;
}
// 10,000 items: ~10,000 operations. Night and day difference.
```

**Space Complexity:** Same idea, but for memory usage.

```typescript
// O(1) space: uses fixed amount of memory
function sumInPlace(arr: number[]): number {
  let total = 0; // One variable, regardless of array size
  for (const num of arr) total += num;
  return total;
}

// O(n) space: memory grows with input
function doubleArray(arr: number[]): number[] {
  const result: number[] = []; // New array of same size
  for (const num of arr) result.push(num * 2);
  return result;
}
```

Big O cheat sheet for common operations:

```
+------------------+--------+--------+--------+--------+
| Data Structure   | Access | Search | Insert | Delete |
+------------------+--------+--------+--------+--------+
| Array            | O(1)   | O(n)   | O(n)*  | O(n)*  |
| Object/Hash Map  | O(1)   | O(n)** | O(1)   | O(1)   |
| Set              | -      | O(1)   | O(1)   | O(1)   |
| Map              | O(1)   | O(n)** | O(1)   | O(1)   |
| Stack            | O(n)   | O(n)   | O(1)   | O(1)   |
| Queue            | O(n)   | O(n)   | O(1)   | O(1)   |
| Linked List      | O(n)   | O(n)   | O(1)***| O(1)***|
| Binary Search    | O(logn)| O(logn)| O(logn)| O(logn)|
|   Tree (balanced)|        |        |        |        |
+------------------+--------+--------+--------+--------+
* Array insert/delete at END is O(1) (push/pop), at START is O(n)
** Search by VALUE is O(n), lookup by KEY is O(1)
*** O(1) if you already have a reference to the node
```

Memorize this table. It shows up in interviews, it shows up in architecture decisions, and it shows up when your CEO asks why the dashboard takes 30 seconds to load.

![](diagram:session-9-2/fig1-model)

### Choose a structure from the operations

A stack supports last-in-first-out behavior, which fits undo history and nested traversal. A queue supports first-in-first-out behavior, which fits work scheduling and breadth-first search. An array provides indexed access and compact iteration. A map associates keys with values. Naming a fashionable structure is less useful than listing the operations the application performs most often and choosing a representation that supports them.

For each structure, write invariants. A stack's top is the most recently pushed item that has not been removed. A queue returns items in insertion order. A linked list's tail has no successor, and its recorded length matches the number of reachable nodes. Tests should check those properties after several operations, not only on a newly created instance.

### Complexity describes growth under assumptions

An O(n) scan examines a number of elements proportional to input size. An O(log n) binary search repeatedly halves a sorted search interval. Big O does not tell you the exact duration on a particular machine, and it does not make every logarithmic implementation faster for tiny inputs. State what n represents and which operation you are analyzing. Building an index has a cost even if later lookups are cheap.

Space analysis includes auxiliary storage created by the algorithm. A copy of an array, a recursion stack, or a frequency map can grow with the input. Distinguish output space when that distinction matters, but state your convention. An algorithm that saves time by storing seen values makes a time-space tradeoff. That tradeoff should be explained, not hidden behind a single complexity label.

### JavaScript operations have costs too

Repeatedly removing the first item of an array can require moving or reindexing remaining elements. A queue can instead keep a head index and periodically compact storage. That design needs its own invariant: active elements begin at the head, and consumed slots should not retain large objects indefinitely. A linked representation avoids some shifts but adds allocation and pointer overhead.

Map and Set provide useful lookup abstractions, but describe performance with appropriate assumptions rather than claiming every implementation guarantees constant time for every input. Object keys also have semantics that differ from map keys. Choose the abstraction that matches the domain. If identifiers are strings and you need explicit key-value operations, a map often makes the intent clearer than a general object used as a dictionary.

### Test sequences, not isolated methods

Push three items, pop one, push another, and drain the stack. Enqueue several items, dequeue one, enqueue another, and check the remaining order. Remove the head, middle, tail, and only node of a linked list. These sequences reveal broken invariants that a single append test misses. Include empty behavior and decide whether it returns undefined or throws a controlled error.

For a simple performance exercise, count logical operations rather than relying only on wall-clock time. Compare a nested search with a map-based lookup as input grows. Then discuss the memory required by the map and the cost of constructing it. The artifact should include implementation, operation tests, an invariant explanation, and a complexity table whose claims match the actual code.

## The demonstration

**Arrays, Objects, Sets, and Maps - Deep Dive**

Arrays in TypeScript:

```typescript
const inventory: string[] = ["Sword", "Shield", "Potion"];

// Access by index: O(1)
const firstInv = inventory[0]; // "Sword"

// Search (find, includes, indexOf): O(n)
const hasShield = inventory.includes("Shield"); // true, checks up to n items

// Push (add to end): O(1) amortized
inventory.push("Bow");

// Pop (remove from end): O(1)
const last = inventory.pop(); // "Bow"

// Unshift (add to start): O(n) - shifts every element!
inventory.unshift("Helmet"); // ["Helmet", "Sword", "Shield", "Potion"]

// Shift (remove from start): O(n) - shifts every element!
inventory.shift(); // removes "Helmet"

// Splice (insert/remove at index): O(n) - shifts elements after index
inventory.splice(1, 0, "Dagger"); // Insert "Dagger" at index 1

// KEY INSIGHT: Arrays are great for ordered data and index access.
// They are BAD for frequent insertions/deletions at the beginning.
```

Sets and Maps:

```typescript
// Sets: collections of UNIQUE values with O(1) add/has/delete
const visitedRooms = new Set<string>();
visitedRooms.add("Entrance Hall");
visitedRooms.add("Dark Corridor");
visitedRooms.add("Entrance Hall"); // Duplicate ignored! Size is still 2

// O(1) lookup - this is the killer feature
visitedRooms.has("Dark Corridor"); // true

// Removing duplicates from an array (common interview trick)
const loot = ["Gold", "Sword", "Gold", "Potion", "Sword"];
const uniqueLoot = [...new Set(loot)]; // ["Gold", "Sword", "Potion"]

// Maps: like objects but with ANY key type and guaranteed order
const bossDefeats = new Map<string, number>();
bossDefeats.set("Dragon Lord", 3);  // O(1)
bossDefeats.get("Dragon Lord");      // 3, O(1)
bossDefeats.has("Dragon Lord");      // true, O(1)

// Map vs Object:
// Use Object: string keys, need JSON serialization
// Use Map: non-string keys, need .size, need guaranteed iteration order
```

Take ten minutes.
The Trial of Blades pauses. Sharpen your mind. Drink water. When we return, we forge our own data structures from scratch.

**Stacks, Queues, and Linked Lists**

Build all three structures yourself after you have seen each one fail once.

Stack implementation:

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }

  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  print(): void {
    console.log("Stack (top -> bottom):", [...this.items].reverse());
  }
}

// Practical example: balanced brackets checker
function isBalanced(expression: string): boolean {
  const stack = new Stack<string>();
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  for (const char of expression) {
    if ("([{".includes(char)) {
      stack.push(char);
    } else if (char in pairs) {
      if (stack.isEmpty() || stack.pop() !== pairs[char]) return false;
    }
  }
  return stack.isEmpty();
}
```

Queue implementation (FIFO - First In, First Out):

```typescript
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void { this.items.push(item); }         // Add to back: O(1)
  dequeue(): T | undefined { return this.items.shift(); }    // Remove from front: O(n)*
  front(): T | undefined { return this.items[0]; }           // Peek at front: O(1)
  isEmpty(): boolean { return this.items.length === 0; }     // Check empty: O(1)
  size(): number { return this.items.length; }               // Get size: O(1)
  // *O(n) because shift() moves every element. Use an object-based queue for O(1) dequeue.
}
```

Linked List implementation:

```typescript
class ListNode<T> {
  value: T;
  next: ListNode<T> | null;
  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList<T> {
  head: ListNode<T> | null = null;
  private length: number = 0;

  // Add to end: O(n) - must traverse to find the end
  append(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) { this.head = newNode; }
    else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = newNode;
    }
    this.length++;
  }

  // Add to beginning: O(1)
  prepend(value: T): void {
    const newNode = new ListNode(value);
    newNode.next = this.head;
    this.head = newNode;
    this.length++;
  }

  // Remove by value: O(n)
  remove(value: T): boolean {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.length--;
      return true;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Search: O(n)
  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  // Reverse in place: O(n) time, O(1) space
  reverse(): void {
    let prev: ListNode<T> | null = null;
    let current = this.head;
    while (current) {
      const next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }
    this.head = prev;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) { result.push(current.value); current = current.next; }
    return result;
  }

  print(): void { console.log(this.toArray().join(" -> ") + " -> null"); }
  getSize(): number { return this.length; }
}
```

Trees (conceptual): Binary Search Tree has left < parent < right. Gives O(log n) search when balanced. The DOM is a tree. React's virtual DOM is a tree. Database indexes use B-trees. You will encounter trees everywhere, but implementing them from scratch is less common than understanding when they are used.

**Side Quest (Optional): Build a Binary Search Tree**

If interviews are on your horizon, BSTs come up often enough that building one once is worth the hour. The invariant: every node's left subtree holds smaller values, the right subtree holds larger ones. That invariant is what makes search O(log n) — every comparison discards half the remaining tree, exactly like binary search on an array.

```typescript
class TreeNode {
  constructor(
    public value: number,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null
  ) {}
}

class BinarySearchTree {
  root: TreeNode | null = null;

  insert(value: number): void {
    const node = new TreeNode(value);
    if (!this.root) { this.root = node; return; }
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) { current.left = node; return; }
        current = current.left;
      } else {
        if (!current.right) { current.right = node; return; }
        current = current.right;
      }
    }
  }

  search(value: number): boolean {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  // In-order traversal visits values in SORTED order - the classic BST party trick
  inOrder(node: TreeNode | null = this.root, result: number[] = []): number[] {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }
}

const bst = new BinarySearchTree();
[50, 30, 70, 20, 40, 60, 80].forEach(v => bst.insert(v));
bst.search(40);   // true
bst.inOrder();    // [20, 30, 40, 50, 60, 70, 80] - sorted!
```

Two things to know for interviews: (1) the O(log n) guarantee only holds when the tree is *balanced* — insert sorted data into a naive BST and it degenerates into a linked list with O(n) search, which is why production systems use self-balancing variants (AVL, red-black) and databases use B-trees; (2) in-order traversal of a BST produces sorted output, a favorite interview question.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-9-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
class Queue {
  constructor() { this.items = []; this.head = 0; }
  enqueue(value) { this.items.push(value); }
  dequeue() {
    if (this.head === this.items.length) return undefined;
    const value = this.items[this.head]; this.items[this.head++] = undefined;
    if (this.head === this.items.length) { this.items = []; this.head = 0; }
    return value;
  }
}
const q = new Queue(); q.enqueue('a'); q.enqueue('b');
check(q.dequeue() === 'a', 'FIFO first'); q.enqueue('c');
check(q.dequeue() === 'b' && q.dequeue() === 'c', 'Interleaved order');
check(q.dequeue() === undefined, 'Empty queue');
console.log('ok: checkpoint-9-2');
```

## Where it breaks

![](diagram:session-9-2/fig2-diagnosis)

### Big O treated as a stopwatch

You throw out an O(n) solution for an O(1) one and the program gets slower. Big O describes how the work grows as the input grows. It does not describe the constant work, the memory, or the size you actually have. A linear scan of fifty items is cheaper than a clever structure you rebuild on every call. Ask how big the input is, measure the operation you care about, and then decide. Cite the growth when you are comparing what happens at ten times the size. Do not cite it as a timing result you never measured.

### Queue uses repeated shift

The queue is an array and every dequeue is `shift()`, which moves every later element. It looks O(1) and it is O(n) per dequeue, so a queue of n items costs O(n²). The bug is quiet at ten items and obvious at ten thousand. Keep a head index and ignore the slots you have already taken, or use a structure with a cheap pop from the front. When you do, state what you do about the empty prefix growing without bound. A correct big-O claim includes the representation, not just the name of the data type.

### Hash lookup called guaranteed constant

You say the lookup is O(1) as if that were a promise. It is an average, under a hash that spreads keys evenly. A hostile or unlucky set of keys collides, and the bucket becomes a list. JavaScript's `Map` is the right tool for this course, and its lookup is expected constant time for ordinary keys. Say "expected" or "average." If you are defending a design against an input an attacker chooses, collision behavior is part of the design, not a footnote.

## Your turn

Take ten minutes.
The trial pauses. Rest your blade arm. The final challenge of this session awaits.

**Exercise 1: Implement a Battle Queue**

**Objective:** Build a turn-based battle system using a Queue.

```typescript
interface Combatant {
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

class BattleQueue {
  private queue: Queue<Combatant> = new Queue<Combatant>();

  addCombatant(combatant: Combatant): void {
    this.queue.enqueue(combatant);
  }

  nextTurn(): Combatant | undefined {
    const combatant = this.queue.dequeue();
    if (combatant && combatant.health > 0) {
      this.queue.enqueue(combatant); // Re-add if alive
    }
    return combatant;
  }

  isOver(): boolean {
    return this.queue.size() <= 1;
  }
}

// Test it:
const battle = new BattleQueue();
battle.addCombatant({ name: "Arthur", health: 100, attack: 25, defense: 15, speed: 10 });
battle.addCombatant({ name: "Goblin King", health: 80, attack: 20, defense: 10, speed: 8 });
battle.addCombatant({ name: "Dark Mage", health: 60, attack: 35, defense: 5, speed: 12 });
```

**Success Criteria:**
- Queue correctly cycles through combatants
- Dead combatants are removed from the cycle
- Battle ends when 0 or 1 combatants remain alive

**Time Estimate:** 20 minutes

**Exercise 2: Linked List Operations**

**Objective:** Practice linked list operations by building a browser history feature.

```typescript
class BrowserHistory {
  private history: LinkedList<string> = new LinkedList<string>();
  private currentIndex: number = -1;

  visit(url: string): void {
    this.history.append(url);
    this.currentIndex++;
  }

  back(): string | undefined {
    if (this.currentIndex <= 0) return undefined;
    this.currentIndex--;
    return this.getNodeAt(this.currentIndex);
  }

  forward(): string | undefined {
    if (this.currentIndex >= this.history.getSize() - 1) return undefined;
    this.currentIndex++;
    return this.getNodeAt(this.currentIndex);
  }

  private getNodeAt(index: number): string | undefined {
    const arr = this.history.toArray();
    return arr[index];
  }

  current(): string | undefined {
    return this.getNodeAt(this.currentIndex);
  }
}
```

**Success Criteria:**
- Can visit pages and navigate back and forward
- Back returns undefined at the beginning
- Forward returns undefined at the end

**Time Estimate:** 15 minutes

## The quest

**Independent Lab: Data Structure Challenge Set**

Solve these problems using the data structures you built today. For each solution, add a comment with the Big O time and space complexity.

1. **Stack Challenge:** Write a function that evaluates a simple math expression in Reverse Polish Notation (e.g., "3 4 + 2 *" = 14). Use a Stack.
2. **Queue Challenge:** Simulate a print queue where 5 documents arrive with different page counts. Process them FIFO and log each document as it prints.
3. **Linked List Challenge:** Implement a `removeDuplicates()` method that removes duplicate values from a linked list.
4. **Set Challenge:** Given two arrays, write a function that returns elements that appear in both arrays (intersection) using a Set for O(n) performance.

**Stretch Goals:**
- Implement a `DoublyLinkedList<T>` with `previous` pointers
- Implement a `PriorityQueue<T>` that dequeues by priority value
- Add an iterator to your LinkedList (implement `[Symbol.iterator]()`)

### Review the artifact

Your deliverable is **Typed data structures with operation tests and time/space analysis**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-9-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Session 9.1 homework. Review array methods (map, filter, reduce, push, pop, shift, unshift, splice). Read the Big O Cheat Sheet at bigocheatsheet.com.
**Materials:** TypeScript development environment, whiteboard or drawing tool for diagramming data structures, Big O reference card.

**Assignment: Data Structure Dungeon**
- **Objective:** Implement all three core data structures and solve problems with them
- **Tasks:**
  1. Implement a `Stack<T>` class with full TypeScript types (if you did not finish during the session)
  2. Implement a `Queue<T>` class with full TypeScript types
  3. Implement a `LinkedList<T>` class with `append`, `prepend`, `remove`, `find`, `reverse`, and `print` methods
  4. Solve the following problems:
     - Use a Stack to check if a string of brackets `()[]{}` is balanced
     - Use a Queue to simulate a print queue (3 documents, process one at a time)
     - Use a LinkedList to implement a browser history (back/forward navigation)
  5. For each solution, add a comment with the Big O time complexity
- **Stretch Goals:**
  - Implement a `DoublyLinkedList<T>` with `previous` pointers
  - Implement a `PriorityQueue<T>` that dequeues by priority value
  - Add an iterator to your LinkedList (implement `[Symbol.iterator]()`)
- **Submission:** Push to your GitHub repo in the `typescript-practice/` folder
- **Due:** Before Session 9.3

---

### Manual verification and further reading

- [Official reference 1](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
