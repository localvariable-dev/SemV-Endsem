# Theory of Computation (TOC) — 2024 Pattern Syllabus

**Subject:** Theory of Computation  
**Pattern:** 2024 Pattern (SPPU / TE Computer Engineering)  
**Total Units:** 5 Units (09 Hours each = 45 Hours Total)  

---

## High-Level Architectural Flow (The Computational Hierarchy)

```
[Unit I & II: Regular Languages]
       │  Abstract Model: Finite Automata (DFA, NFA, ε-NFA, Moore, Mealy)
       │  Formalism: Regular Expressions & Pumping Lemma
       ▼
[Unit III & IV: Context-Free Languages]
       │  Formalism: Context-Free Grammars (Derivations, Normal Forms: CNF, GNF)
       │  Abstract Model: Pushdown Automata (NPDA, Stack-based memory) & Post Machines
       ▼
[Unit V: Computability & Complexity Theory]
          Abstract Model: Turing Machines (DTM, UTM, Halting Problem)
          Boundaries of Computation: Decidability, Undecidability, Reducibility
          Computational Complexity: Classes P, NP, NP-Complete, NP-Hard
```

---

## Detailed Unit Breakdown

### Unit I: Introduction to Formal Languages and Finite Automata (09 Hours)
* **Basic Concepts:**
  * Finite and infinite sets, Alphabets ($\Sigma$), Symbols.
  * Strings: Empty String ($\varepsilon$), Substring of a string, Prefix, Suffix, Concatenation of strings, Length of strings.
  * Languages: Formal Language definition, Finite representation of languages.
  * Operations on Languages: Union ($L_1 \cup L_2$), Concatenation ($L_1 L_2$), Kleene Star ($L^*$), Kleene Plus ($L^+$).
  * Concept of Basic Machine.
* **Finite Automata Without Output:**
  * Finite State Machines (FSM).
  * Deterministic Finite Automata (DFA): 5-tuple formal definition, transition table/graph.
  * Nondeterministic Finite Automata (NFA): Formal definition, power of nondeterminism.
  * NFA with $\varepsilon$-moves ($\varepsilon$-NFA).
  * Inter-conversions:
    * Conversion of $\varepsilon$-NFA to NFA (without $\varepsilon$).
    * Conversion of NFA to DFA (Subset Construction / Power Set method).
    * Conversion of $\varepsilon$-NFA directly to DFA.
  * Minimization of DFAs (Equivalence / Table Filling Method / Myhill-Nerode approach).
* **Finite Automata With Output:**
  * Moore Machines (Output associated with states): Definition, Model, Construction.
  * Mealy Machines (Output associated with transitions): Definition, Model, Construction.
  * Inter-conversion: Moore to Mealy and Mealy to Moore.

---

### Unit II: Regular Expressions and Languages (09 Hours)
* **Regular Expressions (RE):**
  * Introduction, Primitive regular expressions.
  * Operators of RE (Union $+$, Concatenation $\cdot$, Kleene Star $*$), Precedence of operators.
  * Algebraic laws for RE (Distributive, Associative, Commutative, Idempotence).
  * Mapping Languages to Regular Expressions & RE to Languages.
  * Equivalence of two REs.
  * Kleene’s Theorem (Equivalence of FA and RE).
* **Conversions & Algorithms:**
  * RE to NFA / DFA (Thompson’s Construction).
  * DFA to RE using **Arden’s Theorem** ($R = Q + RP \implies R = QP^*$).
* **Properties of Regular Languages:**
  * **Pumping Lemma for Regular Languages:** Statement, proof method, and application in proving languages are *non-regular* (adversarial game approach).
  * **Closure Properties:** Closure under Union, Intersection, Complementation, Concatenation, Kleene Closure, Difference, Reversal.
  * **Decision Properties:** Algorithms to test Membership ($w \in L$), Emptiness ($L = \emptyset$), Finiteness, and Infiniteness.
  * **The Myhill-Nerode Theorem:** Equivalence relations on strings, distinguishing extensions, minimal state lower-bounds.

---

### Unit III: Context Free Grammars (CFG) and Languages (09 Hours)
* **Foundations of CFG:**
  * Formal Definition of CFG ($V, T, P, S$).
  * Sentential forms, Leftmost Derivation (LMD), Rightmost Derivation (RMD).
  * Derivation Trees / Parse Trees: Yield of a tree, connection between derivations and parse trees.
  * Context-Free Languages (CFL).
  * Ambiguity in Grammars: Definition, inherently ambiguous CFLs, techniques to resolve ambiguity (operator precedence & associativity).
  * Writing Grammars for structured languages.
* **Simplification of CFG:**
  * Elimination of $\varepsilon$-productions (Nullable variables).
  * Elimination of Unit productions ($A \to B$).
  * Elimination of Useless symbols and Useless productions (Non-generating & Non-reachable symbols).
* **Normal Forms:**
  * **Chomsky Normal Form (CNF):** Productions of form $A \to BC$ or $A \to a$. Conversion steps and derivation tree height properties ($2^{k-1}$).
  * **Greibach Normal Form (GNF):** Productions of form $A \to a\alpha$. Conversion steps (Left recursion elimination, substitution).
* **Theory of CFL:**
  * **Pumping Lemma for CFLs:** Statement ($uvxyz$), conditions, and proving non-CFL status (e.g., $a^n b^n c^n$).
  * **Closure Properties of CFL:** Closed under Union, Concatenation, Kleene Star; **NOT** closed under Intersection or Complementation.
  * **The Chomsky Hierarchy:** Type 0 (Unrestricted), Type 1 (Context-Sensitive), Type 2 (Context-Free), Type 3 (Regular).
* **Applications of CFG:**
  * Palindromes, Parenthesis matching / Dyck languages.
  * Parsers and Compiler frontend syntax analysis.
  * Markup languages, XML, and Document Type Definitions (DTDs).

---

### Unit IV: Push Down Automata (PDA) (09 Hours)
* **Foundations of PDA:**
  * Introduction: Why FA is insufficient for non-regular memory (finite states vs unbounded LIFO stack).
  * Formal definition of PDA (7-tuple: $Q, \Sigma, \Gamma, \delta, q_0, Z_0, F$).
  * Instantaneous Descriptions (ID) and state-stack transitions.
* **Acceptance Criteria:**
  * Acceptance by Final State ($L(M)$).
  * Acceptance by Empty Stack ($N(M)$).
  * Equivalence proof: $L(M) \iff N(M)$.
* **Nondeterministic vs Deterministic PDA:**
  * Non-deterministic PDA (NPDA) vs Deterministic PDA (DPDA).
  * Power of nondeterminism in PDAs: DPDA $\subset$ NPDA (DPDAs recognize only Deterministic CFLs).
* **Equivalence & Conversions:**
  * Equivalence of PDA and CFG:
    * Conversion of CFG to PDA (Top-down simulation / expansion on stack).
    * Conversion of PDA to CFG (State-triplet variables $[q, X, p]$).
  * PDA vs CFLs: Structural relationships.
* **Applications & Extensions:**
  * Applications of PDA in compilers and runtime stacks.
  * **Introduction to Post Machine:** FIFO Queue-based automata vs LIFO stack, equivalence to Turing machines.

---

### Unit V: Turing Machine and Computability Theory (09 Hours)
* **Turing Machines (TM):**
  * Basic model: Infinite tape, read/write head, state transition mechanism.
  * Formal Definition (7-tuple: $Q, \Sigma, \Gamma, \delta, q_0, B, F$).
  * Representation: Instantaneous Descriptions (ID), Transition tables, Transition graphs.
  * Transition function behavior ($\delta(q, X) = (p, Y, D)$ where $D \in \{L, R\}$).
  * Language accepted by TM: Recursively Enumerable ($RE$) vs Recursive ($R$ / Decidable) languages.
  * Deterministic Turing Machines (DTM) and standard Construction techniques (copying, arithmetic, language recognition such as $a^n b^n c^n$, $ww^R$, $ww$).
  * Universal Turing Machine (UTM): Concept, encoding of TM and input tape as strings, programmable abstract computer.
  * Church-Turing Thesis / Hypothesis: Equivalence of intuitive computability and Turing computability.
  * Comparison Matrix: Finite Automata vs Pushdown Automata vs Turing Machine.
  * Turing Machine Halting Problem ($H_{TM}$ / $A_{TM}$): Halting vs Looping, proof of undecidability via diagonalization.
* **Computability & Decidability Theory:**
  * Decidable Problems vs Undecidable Problems.
  * Reducibility ($A \le_m B$): Mapping reductions, proving undecidability of new problems using known undecidable ones.
  * Undecidable problems that are recursively enumerable.
  * Post Correspondence Problem (PCP) and Modified PCP (MPCP).
* **Computational Complexity Classes:**
  * Resource bounds: Time and Space Complexity measures ($TIME(f(n))$, $SPACE(f(n))$).
  * **Class P:** Polynomial time deterministically decidable problems, closure properties, tractable problems.
  * **Class NP:** Nondeterministic polynomial time verifiable problems.
  * **P vs NP Problem:** Core significance, open millennium question.
  * **NP-Completeness and NP-Hard Problems:**
    * Polynomial-time reductions.
    * Cook-Levin Theorem (Boolean Satisfiability / SAT is NP-Complete).
    * Classic NP-Complete problems: 3-SAT, Clique, Vertex Cover, Hamiltonian Circuit, Traveling Salesperson Problem (TSP).

---

## Strategic Shift: 2019 Pattern vs 2024 Pattern

| Feature | 2019 Pattern | 2024 Pattern | Pedagogical Implication |
| :--- | :--- | :--- | :--- |
| **Total Units** | 6 Units | **5 Units** | Better pacing; 9 hours per unit instead of 7 hours. |
| **Total Hours** | 42 Hours | **45 Hours** | More depth per conceptual model. |
| **Turing Machines & Computability** | Split across Unit V (TM) & Unit VI (Computability & Complexity) | **Merged into Unit V** (Turing Machine & Computability Theory) | Bridges the theoretical machine (TM) directly to hardness and complexity (P/NP) in one unified narrative. |
| **PDA Extensions** | Focused strictly on NPDA/DPDA | Explicit inclusion of **Post Machines** (Queue Automata) | Helps understand why two stacks or one queue equals a Turing Machine. |
| **CFG Applications** | Traditional compiler context | Expanded to **XML, DTDs, and Modern Markup** | Bridges abstract CFG theory to structured data validation and modern parsing. |
