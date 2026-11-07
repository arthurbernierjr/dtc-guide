---
editorial: true
title: The Runesmith's Forge
subtitle: TypeScript Conversion and Design Doc
hook: "A reviewed TypeScript migration and a capstone architecture decision record. Freeze working behavior and identify public contracts."
read: 60
artifact: "A reviewed TypeScript migration and a capstone architecture decision record"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
say:
  - "Baseline: Freeze working behavior and identify public contracts."
  - "Migrate: Type one boundary at a time with strict checking."
  - "Explain: Connect the implementation to an architecture decision."
---

## The hook

Welcome to the Forge. This is build day. For four sessions you have studied the ancient runes of TypeScript, survived the trials of data structures and algorithms, and mapped the grand architecture of scalable systems. Today you put it all together. You are going to take a real JavaScript project you built in a previous unit and convert it to TypeScript. You are going to type your React components, your Express routes, your Mongoose models. And you are going to finalize your system design document.

This is not a lecture-heavy session. This is a working session. I will walk you through the conversion process step by step, show you the common patterns for typing React and Express, and then you are on your own with support. By the end of today, you will have a TypeScript project that compiles with zero errors and a system design document that shows you can think at scale. These two artifacts together prove something important: you can write production-quality code AND think about architecture. That is what makes a technical co-founder.

Let us fire up the forge.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create a TypeScript Migration of an Existing JavaScript Project
You will convert an existing JavaScript project to TypeScript, applying proper type annotations, interfaces, and configuration to produce a fully typed, compiling codebase alongside a system design document.

**Enabling Objectives:**
- Configure tsconfig.json for a full-stack project (React frontend + Express backend)
- Create TypeScript interfaces for all data models, API request/response shapes, and component props
- Type Express routes, middleware, and Mongoose models using TypeScript
- Type React components including props interfaces, state types, event handlers, and hooks
- Write a system design document that includes architecture diagrams, scaling strategy, and technology justifications

**You should be able to:**
- Convert a JavaScript project to TypeScript with zero compilation errors
- Write a system design document suitable for a technical co-founder portfolio
- Produce architecture diagrams that communicate system structure clearly

---

**The TypeScript Conversion Process**

Converting a JavaScript project to TypeScript is a systematic process. Do not try to type everything at once. Follow this order:

```
Step 1: Setup
  - Install TypeScript and type definitions
  - Create tsconfig.json
  - Rename files from .js/.jsx to .ts/.tsx

Step 2: Fix compilation errors in one migrated module (keep strict checking enabled)
  - Add basic type annotations to fix the most obvious errors
  - Use unknown at untrusted boundaries, then narrow with runtime checks

Step 3: Type your data models first
  - Create interfaces for your database models
  - Create interfaces for API request/response shapes
  - These types flow through your entire application

Step 4: Type your backend
  - Express route handlers
  - Middleware
  - Database queries

Step 5: Type your frontend
  - React component props
  - State types
  - Event handlers

Step 6: Enable strict mode
  - Set strict: true in tsconfig.json
  - Fix all remaining errors
  - Replace any remaining 'any' types with proper types
```

**Setting Up tsconfig for a Full-Stack Project**

Backend tsconfig (Express + Node):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Frontend tsconfig (React with Vite or CRA):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Required type definition packages:

```bash
# Backend
npm install --save-dev @types/node @types/express @types/cors @types/morgan

# Frontend (if using CRA or manual setup)
npm install --save-dev @types/react @types/react-dom

# Database
npm install --save-dev @types/mongoose  # if using Mongoose < v7 (v7+ has built-in types)

# Testing
npm install --save-dev @types/jest
```

**Typing Express Routes and Middleware**

```typescript
import express, { Request, Response, NextFunction } from "express";

// Define your request/response types
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface ApiError {
  message: string;
  status: number;
}

// Typed route handler
const createUser = async (
  req: Request<{}, UserResponse, CreateUserRequest>,
  res: Response<UserResponse | ApiError>
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields required", status: 400 });
      return;
    }

    // Create user (database call)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

// Typed middleware
interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided", status: 401 });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token", status: 401 });
  }
};

// Typed route params
interface PostParams {
  id: string;
}

const getPost = async (
  req: Request<PostParams>,
  res: Response
): Promise<void> => {
  const { id } = req.params; // TypeScript knows id is string
  const post = await Post.findById(id);

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res.json(post);
};
```

**Typing Mongoose Models**

```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for your document
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user"
    }
  },
  { timestamps: true }
);

// Add methods with types
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the typed model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
```

**Typing React Components**

```tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

// Props interface
interface ProfileCardProps {
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  isOnline: boolean;
  onEdit: (field: string, value: string) => void;
  onDelete: () => void;
}

// Typed functional component
const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  avatar,
  bio,
  isOnline,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEditValue(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onEdit("bio", editValue);
    setIsEditing(false);
  };

  return (
    <div className="profile-card">
      <img src={avatar || "/default-avatar.png"} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      <span className={isOnline ? "online" : "offline"}>
        {isOnline ? "Online" : "Offline"}
      </span>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <input value={editValue} onChange={handleChange} />
          <button type="submit">Save</button>
        </form>
      ) : (
        <p onClick={() => setIsEditing(true)}>{bio}</p>
      )}
      <button onClick={onDelete}>Delete</button>
    </div>
  );
};

export default ProfileCard;
```

```tsx
// Typing hooks: useState with complex types
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) throw new Error("Failed to fetch");
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <small>By {post.author} on {post.createdAt}</small>
        </article>
      ))}
    </div>
  );
};
```

![](diagram:session-9-5/fig1-model)

### Choose a migration boundary with a reason

Begin with a module that has a clear contract and useful tests. A domain calculation, API response parser, or service interface is a better first target than renaming every file at once. Capture the current behavior and note known defects separately. A migration should not accidentally redefine the product because the compiler made one representation easier to express.

List the module's inputs, outputs, side effects, and consumers. Identify where data enters from the network, storage, or user input. Those values require runtime validation even after their internal representation is typed. Distinguish a type declaration from a parser. The former helps the compiler reason; the latter examines actual values. Keep both responsibilities visible in the migrated design.

### Use compiler feedback as investigation

When strict checking reports a possible undefined value, inspect whether absence is legitimate. If it is, model and handle it. If it is not, move the guarantee to a boundary where it can be established. A non-null assertion may occasionally express a real invariant, but it should not become the default way to silence errors. Each escape hatch deserves a reason and a follow-up if it represents temporary debt.

Convert shared contracts before duplicating them across client and server. Shared types can reduce naming mismatches, but they do not replace versioning or validation between independently deployed services. A browser can still send old or malicious data. Keep server checks authoritative. If your build configuration differs between environments, separate configuration files rather than forcing incompatible settings into one universal file.

### Keep changes reviewable

Make a small sequence of commits or clearly separated patches: configuration, one module conversion, consumer updates, and validation tests. Avoid mixing a large behavior rewrite with the type migration unless the task explicitly requires it. A reviewer should be able to distinguish a type improvement from a product change. Run the existing behavior tests after each meaningful slice.

Document compiler and runtime commands for manual setup. If the required TypeScript toolchain is not installed, mark compiler execution pending and do not infer success from syntax coloring in the editor. The browser checkpoint in this lesson checks a runtime concept only. Your final local submission should include actual compiler output once you have installed and run the toolchain yourself.

### Write one architecture decision record

Choose a decision you actually made: where validation lives, whether the client and server share types, or why a service remains inside the monolith. State the context, alternatives, decision, consequences, and a condition that would trigger reconsideration. A decision record is not a list of technologies. It explains why the chosen structure fits the current constraints.

Trace a concrete request through the architecture diagram and the implementation. Name the entry point, validation boundary, authorization check, persistence call, and response model. If the diagram shows a queue that the code does not use, remove it or mark it explicitly as a future option. The document must describe the system you built, with future ideas clearly separated.

### Review with a change scenario

Ask a peer how the system would handle a new optional field or a new status value. Which files change? Which tests fail? Which external contract needs versioning? This exercise reveals whether the types clarify the architecture or merely add syntax. Update the design record with one limitation discovered during review. The finished artifact combines code, evidence, and explanation in a form another developer can maintain.

## The demonstration

**Live Conversion: Express API Route**

Convert one real Express route from JavaScript to TypeScript, in this order:

1. Rename the file from `.js` to `.ts`
2. Add imports with types
3. Create interfaces for request/response shapes
4. Add type annotations to route handlers
5. Fix compilation errors
6. Run `tsc --noEmit` to verify

**Live Conversion: React Component**

Convert one React component from `.jsx` to `.tsx`:

1. Rename the file
2. Create a props interface
3. Add types to useState hooks
4. Type event handlers
5. Fix any remaining errors

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-9-5
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const boundaries = [{name: 'request', typed: true, validated: true}, {name: 'provider', typed: true, validated: false}];
const unsafe = boundaries.filter(b => !b.typed || !b.validated);
check(unsafe.length === 1 && unsafe[0].name === 'provider', 'Types alone do not validate runtime input');
console.log('ok: checkpoint-9-5');
```

## Where it breaks

![](diagram:session-9-5/fig2-diagnosis)

### Mass rename hides defects

A single commit renames two hundred files, reformats them, and changes a condition in the middle. Review cannot see the condition. Split the work. One change for the rename, with no behavior in it, so the diff is paths. A separate change for the formatting, if you must. Then the behavior change, small enough to read. A migration that mixes those will ship a logic bug under a wall of green "renamed" lines, and the person who finds it will be you, in production.

### Any used as an escape hatch

The migration is "done" and `any` is scattered through the files that were annoying, so the compiler is quiet for the wrong reason. `any` is a hole you opted into. Keep a list of the remaining ones and a reason next to each, in the code. Prefer `unknown` and a check. A count of `any` that only goes up is not a migration. It is the old JavaScript with extra syntax. The forge is finished when the holes that remain are named, not when the command exits without an error.

### Design diverges from code

The diagram shows a queue between the API and the mailer, and the code calls the mailer directly in the route. Both artifacts exist. They describe different systems. Pick one request and walk it through the diagram and then through the code, naming each hop. Where they disagree, change one of them today. An architecture document that does not match the branch is fiction, and fiction is what you will trust during the next incident unless you have done this walk recently.

## Your turn

Take ten minutes.
The forge is hot. Step away, cool down, and prepare for the final push. When we return, you convert your own project.

**Guided Conversion: Your First File**

Pick one file from your project and convert it. Start with a model or a utility, not the most tangled component.

**Success Criteria for this exercise:**
- One file fully converted to TypeScript
- All types explicitly defined (no `any`)
- File compiles with `tsc --noEmit --strict`

## The quest

**Independent Lab: Full Project Conversion**

This is the main work session. You have 90 minutes to convert as much of your project as possible.

**Conversion Checklist:**
- [ ] tsconfig.json created and configured
- [ ] Type definition packages installed
- [ ] Data model interfaces created (at least 3)
- [ ] At least 2 Express route files converted to TypeScript
- [ ] At least 2 React component files converted to TypeScript
- [ ] At least 1 use of generics somewhere in your codebase
- [ ] Project compiles with `tsc --noEmit` (zero errors)

**System Design Document Finalization:**
If your TypeScript conversion is in good shape, spend the remaining time finalizing your system design document:
- [ ] Architecture diagram is clear and complete
- [ ] All components are labeled and explained
- [ ] Scaling strategy is documented
- [ ] At least 3 bottlenecks identified with mitigation strategies
- [ ] Technology choices are justified

**Errors worth expecting:**
- Third-party libraries without type definitions
- Complex generic types with React hooks
- Typing middleware chains in Express
- Mongoose model typing quirks

### Review the artifact

Your deliverable is **A reviewed TypeScript migration and a capstone architecture decision record**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

### Unit project: completion contract

### Unit Project: "The Runesmith's Forge: TypeScript Conversion and System Design"

**Quest Arc:** The ancient Runesmith's Forge has been dormant for centuries. Its fires have gone cold, its inscriptions faded. But you have learned the old language. You have survived the trials. Now you must prove your mastery by translating existing spells (your JavaScript code) into the more powerful runic language (TypeScript), forging them into something stronger, more reliable, and more resilient. And you must draw the architectural blueprints for a kingdom-scale system, proving you can think beyond a single castle and plan for an empire. Only those who complete both tasks earn the Runesmith's mark.

### Project Overview

Convert an existing JavaScript project (from Unit 5, 6, 7, or 8) to TypeScript AND produce a system design document that demonstrates architectural thinking. This project combines the practical skill of TypeScript migration with the strategic skill of system design.

### Technical Requirements

**TypeScript Conversion (Boss Clear - 70 points):**
- [ ] Project has a properly configured `tsconfig.json` with `strict: true`
- [ ] All required `@types/*` packages are installed
- [ ] At least 5 TypeScript interfaces defined for data models
- [ ] At least 3 Express route handler files converted to TypeScript with typed Request/Response
- [ ] At least 3 React component files converted to TypeScript with props interfaces
- [ ] All `useState` hooks have explicit type annotations
- [ ] Event handlers are properly typed (ChangeEvent, FormEvent, MouseEvent)
- [ ] Mongoose models have TypeScript interfaces (IUser, IPost, etc.)
- [ ] At least 1 use of generics (generic function, generic class, or generic utility type)
- [ ] At least 1 discriminated union or type guard
- [ ] Project compiles with `tsc --noEmit` with zero errors
- [ ] No use of `any` (except with a `// TODO: type this properly` comment and justification)

**System Design Document (Epic Loot - 20 points):**
- [ ] Architecture diagram showing all major components (client, server, database, cache, third-party services)
- [ ] Written description of each component and its responsibility
- [ ] Database schema overview (collections/tables and relationships)
- [ ] Scaling strategy document addressing 1K, 10K, and 100K user scenarios
- [ ] Identification of 3+ potential bottlenecks with mitigation strategies
- [ ] Technology choice justifications (why this database, why this framework, why this hosting)
- [ ] At least 1 page of written analysis (minimum 500 words)

**Algorithm Analysis (Legendary - 10 points):**
- [ ] Analysis of 3+ algorithm problems with full TypeScript solutions
- [ ] Each solution includes Big O time and space complexity analysis
- [ ] At least 2 different algorithm patterns demonstrated (frequency counter, two pointers, sliding window, binary search, divide and conquer)
- [ ] At least 1 problem includes both a brute-force and optimized solution with explanation of the improvement
- [ ] All algorithm solutions compile with TypeScript strict mode

### Skill Points Rubric

**Boss Clear (70 points) - TypeScript Conversion:**

| Criteria | Points |
|----------|--------|
| tsconfig.json properly configured with strict mode | 5 |
| 5+ interfaces for data models | 10 |
| 3+ Express routes typed (Request, Response, middleware) | 10 |
| 3+ React components typed (props, state, events) | 10 |
| Mongoose models with TypeScript interfaces | 10 |
| At least 1 generic usage | 5 |
| At least 1 type guard or discriminated union | 5 |
| Zero compilation errors with tsc --noEmit | 10 |
| No untyped `any` usage | 5 |

**Epic Loot (20 points) - System Design Document:**

| Criteria | Points |
|----------|--------|
| Architecture diagram (clear, complete, labeled) | 5 |
| Component descriptions and responsibilities | 3 |
| Scaling strategy (1K to 100K users) | 4 |
| Bottleneck identification and mitigation | 4 |
| Technology justifications | 2 |
| Written analysis quality and depth | 2 |

**Legendary (10 points) - Algorithm Analysis:**

| Criteria | Points |
|----------|--------|
| 3+ algorithm problems with TypeScript solutions | 4 |
| Big O analysis for each solution | 3 |
| Brute-force vs. optimized comparison for at least 1 problem | 3 |

### Submission Requirements

1. Push your TypeScript-converted project to GitHub
2. Include `SYSTEM_DESIGN.md` in the repo root with embedded or linked diagrams
3. Include `ALGORITHM_ANALYSIS.md` with your algorithm solutions and analysis
4. Ensure `npm install && tsc --noEmit` runs successfully (provide instructions in README)
5. Due date: Before Unit 10, Session 1

---

![](diagram:session-9-5/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete the system design document homework from Session 9.4. Choose a JavaScript project from a previous unit (Unit 5 or 6 recommended) that you will convert to TypeScript. Have the project repo cloned and ready.
**Materials:** An existing JavaScript project (React + Express recommended), TypeScript documentation, tsconfig reference, type definition packages (@types/*).

**Assignment: Complete TypeScript Conversion and System Design Document**
- **Objective:** Finish converting your project to TypeScript and polish your system design document
- **Tasks:**
  1. Complete the TypeScript conversion of your chosen project
  2. Ensure `tsc --noEmit --strict` passes with zero errors
  3. Finalize your system design document with architecture diagrams
  4. Write a brief README section explaining the TypeScript migration process you followed
  5. Analyze 3 algorithm problems you encountered during the course and document their Big O complexity
- **Submission:** Push the completed TypeScript project and system design document to your GitHub repo
- **Due:** Before Unit 10 begins

---

### Manual verification and further reading

- [Official reference 1](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
