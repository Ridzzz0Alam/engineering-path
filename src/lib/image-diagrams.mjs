// Mermaid versions of the handbook's illustrations. The remark plugin swaps an image for its
// entry here, so lessons keep their original Markdown and a re-import doesn't undo the swap.
// Keys are "<part folder>/<image name>". Numbers are only those the image or lesson states.

export const IMAGE_DIAGRAMS = {
  'part-0-start-here/00-the-api-line': `flowchart TB
  subgraph above["Above the API line: consumes models"]
    AI["AI engineer"] --- T["Chat, search and tool features"]
  end
  subgraph below["Below the API line: changes model weights"]
    R["Researcher"] --> S["Model servers"]
    M["ML engineer"] --> S
  end
  AI -- "The API line" --> S`,

  'part-0-start-here/01-seven-skills': `flowchart LR
  S["One ordinary script"]
  S --- A["Python"]
  S --- B["HTTP"]
  S --- C["JSON"]
  S --- D["async"]
  S --- E["Git"]
  S --- F["Docker"]
  S --- G["Postgres"]`,

  'part-0-start-here/02-batch-divergence': `flowchart LR
  P["Same prompt"] --> S["Small batch: identical tokens"]
  P --> L["Large batch: identical tokens"]
  S --> SF{"Token 103: near-tie flips"}
  L --> LF{"Token 103: near-tie flips"}
  SF --> S2["Small-batch output continues one way"]
  LF --> L2["Large-batch output forks another way"]`,

  'part-0-start-here/03-escalation-ladder': `flowchart BT
  A["1. Prompt: lowest cost"] --> B["2. Context"]
  B --> C["3. Retrieval: most features stop here"]
  C --> D["4. Tools"]
  D --> E["5. Agents"]
  E --> F["6. Fine-tune: highest cost"]`,

  'part-1-how-models-behave/00-the-cost-ladder': `flowchart LR
  A["Local: $0 + GPU"] -- "about 10x" --> B["Fast: $0.10-$1"]
  B -- "about 10x" --> C["Mid: $1-$3"]
  C -- "about 10x" --> D["Frontier: $5-$10"]`,

  'part-1-how-models-behave/01-script-inflation': `flowchart LR
  subgraph more["More characters per token: cheaper"]
    A["Latin: 2.61"] --> B["Cyrillic"]
  end
  subgraph fewer["Fewer characters per token: costlier"]
    C["Arabic"] --> D["Devanagari"] --> E["Tibetan: 0.49"]
  end
  B --> C
  R["English rule of thumb: 4 characters per token"] -.-> A`,

  'part-1-how-models-behave/01-context-budget': `flowchart LR
  subgraph W["Context window (e.g. 1M tokens)"]
    direction LR
    A["System prompt"] --- B["Conversation history"] --- C["Retrieved docs"] --- D["Tool defs"] --- E["User turn"] --- F["Reserved for output"]
  end`,

  'part-1-how-models-behave/02-temperature-shapes-the-curve': `flowchart LR
  L["Same logits"] --> A["T = 0.2: near-deterministic, one token dominates"]
  L --> B["T = 1.0: default, one leader with a tail"]
  L --> C["T = 2.0: flat, tokens nearly equal"]`,

  'part-1-how-models-behave/03-vector-space-proximity': `flowchart LR
  subgraph one["Neighbourhood: places"]
    A["Paris"] --- B["French city"]
  end
  subgraph two["Neighbourhood: food"]
    C["pizza"] --- D["Italian food"]
  end
  subgraph three["Neighbourhood: programming"]
    E["Python"] --- F["code"]
  end
  Q{{"Query: how to parse JSON"}} -- "lands near" --> E`,

  'part-1-how-models-behave/03-what-embeddings-power': `flowchart TB
  E["Embedding"] --> S["Search"]
  E --> R["Routing"]
  E --> M["Memory"]
  E --> C["Clustering"]`,

  'part-1-how-models-behave/04-two-token-streams': `flowchart LR
  P["Your prompt"] --> T["Thinking tokens: hidden, billed at full rate, 4,200 tokens"]
  P --> O["Output tokens: visible, returned, billed, 200 tokens"]
  T -.-> O
  O --> R["Response: output_text"]
  T --> U["Response: usage.thinking_tokens: 4,200"]`,

  'part-1-how-models-behave/05-triangle': `flowchart TB
  Q["High Quality"]
  C["Low Cost"]
  L["Low Latency"]
  Q --- H["High-Stakes Extraction"] --- C
  Q --- B["Batch Summarization"] --- L
  C --- R["Realtime Chat"] --- L`,

  'part-1-how-models-behave/05-ttft': `flowchart LR
  subgraph fast["Under the 2 s interactive limit"]
    A["Cerebras / Groq open-weight: about 0.2 s"] --> B["Claude Sonnet 4.6: 0.74 s"] --> C["GPT-5.5 standard: about 1.1 s"]
  end
  subgraph slow["Over the limit"]
    D["Claude Opus max thinking: 28 s"] --> E["GPT-5.5 Pro max reasoning: 67 s"]
  end
  C -- "2 s interactive limit" --> D`,

  'part-1-how-models-behave/06-distribution-drift': `flowchart LR
  L["Launch: eval and production quality match"] --> E["Eval score stays flat"]
  L --> P["Production quality declines"]
  E --> G["Invisible gap widens"]
  P --> G
  G --> V["Drift becomes visible, by 6 months the gap is large"]`,

  'part-10-deployment-and-cost/00-utilization-multiplier': `flowchart LR
  A["10% utilization: above the premium API price"] --> B["30%: still above it"]
  B -- "premium API price line" --> C["60%: below it"]
  C --> D["80%: lower"]
  D --> E["100%: lowest cost per 1K tokens"]`,

  'part-10-deployment-and-cost/01-kv-cache-growth': `flowchart LR
  subgraph small["Llama 3.1 8B"]
    A["Model weights"] --- B["Small KV cache"]
  end
  subgraph large["Llama 3.3 70B"]
    C["Model weights: already near the A100 80GB limit"] --- D["KV cache at 8K context, batch 8: pushes past it"]
  end
  A --> C`,

  'part-10-deployment-and-cost/02-customization-decision-tree': `flowchart TB
  Q["Quality below target?"] --> G{"Knowledge or behavior gap?"}
  G -- "Knowledge" --> R["RAG"]
  G -- "Behavior" --> S{"Task stable? Volume justifies?"}
  S --> P["Prompt + few-shot: lowest cost"]
  S --> L["LoRA"]
  S --> D["Distillation: highest cost and maintenance"]`,

  'part-10-deployment-and-cost/03-five-lever-waterfall': `xychart-beta
  title "Monthly bill after each lever: $19,500 to $4,960"
  x-axis ["Baseline", "After caching", "After batching", "After routing", "After distillation"]
  y-axis "Dollars per month" 0 --> 20000
  bar [19500, 8850, 6230, 6460, 4960]`,

  'part-10-deployment-and-cost/04-latency-waterfall': `flowchart LR
  subgraph without["Without cache: TTFT about 360 ms"]
    A1["Network 20"] --> A2["Queue 50"] --> A3["Tokenize 10"] --> A4["Prefill 280"] --> A5["Decode"]
  end
  subgraph with["With prefix cache: TTFT about 110 ms"]
    B1["Network 20"] --> B2["Queue 50"] --> B3["Tokenize 10"] --> B4["Prefill 30"] --> B5["Decode"]
  end`,

  'part-11-ai-product/00-streaming-failure-modes': `flowchart TB
  I["Ideal: tokens arrive at a steady rate"]
  I --> A["Smooth: actual matches ideal"]
  I --> B["Slow start: late first token (TTFT), then parallel to ideal"]
  I --> C["Slow stream: half the slope throughout"]
  I --> D["Mid-stream stall: matches ideal, flatlines, then resumes"]`,

  'part-11-ai-product/02-two-layer-instrumentation': `flowchart LR
  subgraph infra["AI infrastructure: describes the call"]
    A["gen_ai.conversation.id"] --- B["input/output tokens"] --- C["operation.duration"]
  end
  subgraph product["Product analytics: describes the outcome"]
    D["session_start"] --- E["ai_response_action"] --- F["downstream_action_taken"] --- G["session_end"]
  end
  infra <-- "request_id" --> product`,

  'part-11-ai-product/05-growth-loop': `flowchart LR
  A["User action"] -- "implicit signals" --> B["Signal captured"]
  B --> C["Model improved"]
  C -- "deployed change" --> D["Better outputs"]
  D -- "compounding" --> A`,

  'part-2-working-with-model-apis/00-system-prompt-placement': `flowchart TB
  P["Same system prompt: three places"]
  P --> O["OpenAI Chat Completions: role system, inside messages"]
  P --> A["Anthropic Messages: top-level system field, outside messages"]
  P --> G["Gemini generateContent: top-level systemInstruction, outside contents"]`,

  'part-2-working-with-model-apis/01-ttft-vs-full-response': `flowchart LR
  subgraph stream["Streaming"]
    A["0 s: blank"] --> B["1 s: first token"] --> C["Text fills in"] --> D["6 s: done"]
  end
  subgraph nostream["Non-streaming"]
    E["0 s: blank"] --> F["Blank until the end"] --> G["6 s: full response lands"]
  end`,

  'part-2-working-with-model-apis/02-json-mode-vs-strict-mode': `flowchart TB
  subgraph json["JSON mode: syntax valid, schema not enforced"]
    A["Output may match"] --- B["Wrong or missing field possible"]
  end
  subgraph strict["Strict mode: schema enforced at every token"]
    C["Every output matches the schema"]
  end
  json --> V["Values inside can still be semantically wrong"]
  strict --> V`,

  'part-2-working-with-model-apis/03-tool-calling-loop': `flowchart LR
  A["Send messages"] --> B{"Model responds"}
  B -- "no tool calls" --> X["Return text"]
  B -- "tool calls" --> C["Execute tools (your code)"]
  C --> D["Append results"]
  D --> E["Loop"]
  E --> A`,

  'part-2-working-with-model-apis/04-jitter-vs-no-jitter': `flowchart TB
  R["Same ten retries, same window"]
  R --> A["No jitter: thundering herd, retries bunch in spikes at 1 s, 2 s, 4 s, 8 s"]
  R --> B["Full jitter: retries spread evenly across the window"]`,

  'part-2-working-with-model-apis/05-distribution-gap': `flowchart LR
  A["Arena prompt distribution: general chat, coding, travel"] --- O["Small overlap: where the rank transfers"] --- B["Your product task: contracts, medical notes, routing"]
  A -.-> T["Tested by Arena"]
  B -.-> N["Not tested at all"]`,

  'part-2-working-with-model-apis/06-failover-tiers': `flowchart TB
  subgraph t1["Tier 1. Triggers: 429, 5xx"]
    A["Request"] --> B["OpenAI gpt-4o: retry x2"]
  end
  subgraph t2["Tier 2. Trigger: deployment cooldown"]
    C["Request"] --> D["OpenAI gpt-4o"] -- "sibling" --> E["Azure gpt-4o"]
  end
  subgraph t3["Tier 3. Triggers: context exceeded, content policy"]
    F["Request"] --> G["gpt-4o"] --> H["claude-sonnet"]
  end
  t1 --> t2 --> t3`,

  'part-2-working-with-model-apis/07-cost-curve': `flowchart LR
  T["Turn 1"] --> N["No cache: steep rise to $1.53 at turn 10"]
  T --> C["With cache: small first-turn write, cache warm, then $0.47 at turn 10"]
  N --> G["The gap widens every turn"]
  C --> G`,

  'part-3-prompt-engineering/00-monolithic-vs-modular': `flowchart LR
  subgraph mono["Monolithic"]
    A["One dense block"] --- A1["Contradiction"]
    A --- A2["Critical rule buried"]
    A --- A3["No escape hatch"]
  end
  subgraph mod["Modular"]
    B["Role"] --> C["Instructions"] --> D["Constraints"] --> E["Output contract"] --> F["Escape hatches"]
  end
  mono -- "same content" --> mod`,

  'part-3-prompt-engineering/01-over-prompting-curve': `flowchart LR
  A["Zero-shot baseline"] -- "accuracy rises" --> B["Anthropic recommends 3 to 5"]
  B --> C["Peak: 5 to 25 examples"]
  C -- "accuracy falls" --> D["Over-prompting zone"]`,

  'part-3-prompt-engineering/02-cot-inversion': `flowchart TB
  subgraph std["Standard model"]
    A["Think step by step"] --> B["Visible reasoning chain"] --> C["Correct answer: +18%"]
  end
  subgraph rsn["Reasoning model"]
    D["Think step by step"] --> E["Collides with hidden reasoning"] --> F["Worse answer, slower: -3% accuracy, +68% latency"]
  end`,

  'part-3-prompt-engineering/04-label-pointer-model': `flowchart LR
  subgraph reg["Prompt registry: immutable versions"]
    V14["v14"]
    V13["v13"]
    V12["v12"]
  end
  S(["staging"]) --> V14
  P(["production"]) --> V13
  APP["App service"] -- "fetches by label" --> P`,

  'part-4-eval-fundamentals/00-vibes-vs-evals': `flowchart LR
  subgraph no["No evals"]
    A["Ship to users"] --> B["User complaints"] --> C["Fix one thing"] --> D["Break another thing"] --> B
  end
  subgraph yes["With evals"]
    E["Code change"] --> F["Eval suite (CI)"] --> G{"Green / Red gate"} --> H["Production monitor"] -- "failures become tests" --> I["New test cases"] --> F
  end`,

  'part-4-eval-fundamentals/01-error-analysis-funnel': `flowchart LR
  A["Traces"] --> B["Open coding: free-text notes"]
  B --> C["Taxonomy: Date handling 41"]
  B --> D["Taxonomy: Handoff 18"]
  B --> E["Taxonomy: Tone 12"]
  C --> F["Write tests"]
  D --> F
  E --> F`,

  'part-4-eval-fundamentals/02-binary-vs-likert-agreement': `flowchart TB
  O["Two annotators, same ten outputs"]
  O --> B["Binary pass/fail: agree on 8 of 10"]
  O --> L["1 to 5 scale: agree on 2 of 10"]`,

  'part-4-eval-fundamentals/03-assertion-pyramid': `flowchart BT
  A["Format checks: cheapest, fastest"] --> B["Schema validation"]
  B --> C["String predicates"]
  C --> D["Execution probes"]
  D -.-> E["LLM-as-judge: last resort, highest cost"]`,

  'part-5-context-engineering/00-context-equation': `flowchart LR
  P["Prompt"] --> W["Context window: finite tokens"]
  M["Memory"] --> W
  R["Retrieval"] --> W
  T["Tools"] --> W
  D["Metadata"] --> W
  C["Constraints"] --> W
  W --> L["LLM"]`,

  'part-5-context-engineering/01-context-budget-stack': `flowchart TB
  A["System + tools: never evict"] -- "priority falls" --> B["Retrieved: evict oldest"]
  B --> C["History: compress"]
  C --> D["Scratch: evict aggressively"]`,

  'part-5-context-engineering/02-lost-in-the-middle': `flowchart LR
  A["First documents: high accuracy (primacy)"] --> B["Middle documents: worse than no docs, below the closed-book baseline"]
  B --> C["Last documents: high accuracy (recency)"]`,

  'part-5-context-engineering/03-memory-scopes-timeline': `flowchart LR
  A["Conversation state: one call"] --> B["Session state: one session"] --> C["Long-term user memory: months"]`,

  'part-5-context-engineering/04-metadata-injection-timeline': `flowchart LR
  subgraph sys["System prompt: cached, stable for 24h"]
    A["Date (ISO)"] --- B["Role"] --- C["Locale + tz"]
  end
  subgraph usr["User message: fresh per turn"]
    D["Time of day"]
  end
  sys --> usr --> M["Model"]`,

  'part-5-context-engineering/05-two-layer-testing': `flowchart LR
  subgraph asm["Assembly layer"]
    A["Property tests"] --> B["Hash snapshot"] --> C["Token budget"] --> D["CI: fast, cheap, no API calls"]
  end
  subgraph mdl["Model layer"]
    E["Golden cohort"] --> F["Aggregate gate"] --> G["LLM-as-judge"] --> H["Pre-deploy: slower, costs tokens"]
  end
  asm -- "messages[]" --> mdl`,

  'part-6-retrieval-augmented-generation/00-cost-shapes': `flowchart LR
  L["Long context: $1.51 per query"]
  R["RAG: $0.015 per query, plus a one-time index"]
  F["Fine-tune: per-query cost plus large one-time training"]
  L ~~~ R ~~~ F`,

  'part-6-retrieval-augmented-generation/01-table-parsing-failure': `flowchart TB
  Q["Q2 revenue?"] --> A["Flattened text: Revenue 8417 9192 10347 Operating income 1187 1453 1737"]
  Q --> B["Structured HTML: Revenue row, Q2 column = 9192"]
  A --> X["Fails: relationships are gone"]
  B --> Y["Works: headers intact"]`,

  'part-6-retrieval-augmented-generation/01-chunking-strategy-ladder': `flowchart BT
  A["Recursive 512: default start, 1x"] -- "mixed query types" --> B["Sentence: 1x"]
  B -- "topic shifts" --> C["Semantic: 14x slower"]
  C -- "domain structure" --> D["Structure-aware: needs parser"]
  D -- "context-loss bottleneck" --> E["Contextual: $1/M tokens"]`,

  'part-6-retrieval-augmented-generation/02-hnsw-layered-graph': `flowchart TB
  Q(["Query"]) --> L2
  subgraph top["Layer 2: long-range hops"]
    L2["Entry point"]
  end
  subgraph mid["Layer 1: denser"]
    L1a["Hop"] --> L1b["Hop"]
  end
  subgraph bot["Layer 0: dense neighbourhood"]
    L0["Nearest match"]
  end
  L2 --> L1a
  L1b --> L0`,

  'part-6-retrieval-augmented-generation/03-rrf-fusion': `flowchart LR
  subgraph bm["BM25"]
    A1["1 doc A"] --- A2["2 doc C"] --- A3["3 doc B"] --- A4["4 doc E"] --- A5["5 doc D"]
  end
  subgraph dn["Dense"]
    B1["1 doc A"] --- B2["2 doc F"] --- B3["3 doc C"] --- B4["4 doc G"] --- B5["5 doc H"]
  end
  subgraph rrf["RRF fused: score = sum of 1 / (60 + rank)"]
    C1["doc A 0.033"] --- C2["doc C 0.025"] --- C3["doc F 0.016"] --- C4["doc B 0.016"] --- C5["doc E 0.016"]
  end
  bm --> rrf
  dn --> rrf`,

  'part-6-retrieval-augmented-generation/03-reranker-curve': `flowchart LR
  A["10 candidates: below the no-reranker baseline"] -- "quality rises" --> B["Sweet spot: 50 to 100"]
  B -- "quality degrades" --> C["500 candidates: back near the baseline"]`,

  'part-6-retrieval-augmented-generation/04-vocabulary-gap': `flowchart LR
  Q["User query: cheap, flights, europe"] -- "embedding similarity, zero shared words" --> D["Target document: affordable, air, travel, European, destinations, June, August"]`,

  'part-6-retrieval-augmented-generation/05-faithfulness-vs-accuracy': `quadrantChart
  x-axis Low faithfulness --> High faithfulness
  y-axis Low accuracy --> High accuracy
  quadrant-1 Grounded and correct
  quadrant-2 Lucky guess
  quadrant-3 Hallucination
  quadrant-4 Faithful but wrong`,

  'part-6-retrieval-augmented-generation/06-advanced-retrieval-decision-tree': `flowchart LR
  Q["Incoming query"] --> A{"Single-pass retrieval enough?"}
  A -- "yes" --> V["Vanilla RAG: low cost"]
  A -- "no" --> B{"Global, dataset-wide question?"}
  B -- "yes" --> G["GraphRAG: high cost"]
  B -- "no" --> C{"Visually complex PDFs?"}
  C -- "yes" --> P["ColPali: medium cost"]
  C -- "no" --> R["Agentic RAG: high cost"]`,

  'part-6-retrieval-augmented-generation/07-retrieval-vs-generation-failure': `quadrantChart
  x-axis Low faithfulness --> High faithfulness
  y-axis Low context recall --> High context recall
  quadrant-1 Healthy
  quadrant-2 Generation failure, fix the generator
  quadrant-3 Both broken, fix retrieval first
  quadrant-4 Retrieval failure, faithful to bad context`,

  'part-6-retrieval-augmented-generation/08-blue-green-reindex': `flowchart LR
  T["Production traffic"] -.-> V1["index_v1: ada-002"]
  N["New documents"] --> V2["index_v2: 3-large"]
  V1 --- G["Golden queries compare both"] --- V2
  G --> S{"Alias swap"}
  S -- "cutover" --> V2
  T -.-> S`,

  'part-7-agent-engineering/00-control-flow-ownership': `flowchart TB
  subgraph wf["Workflow: Python owns the decision"]
    A["LLM call"] --> B{"if intent =="}
    B --> B1["billing"]
    B --> B2["technical"]
    B --> B3["other"]
  end
  subgraph ag["Agent: model owns the decision, up to max steps"]
    L["LLM"] <--> T1["tool A"]
    L <--> T2["tool B"]
    L <--> T3["tool C"]
  end`,

  'part-7-agent-engineering/01-five-patterns-map': `flowchart TB
  subgraph seqp["Sequential"]
    A["Chaining: static"]
    B["Routing: static"]
    C["Evaluator-optimizer: dynamic, with a loop"]
  end
  subgraph parp["Parallel"]
    D["Parallelization: static"]
    E["Orchestrator-workers: dynamic"]
  end`,

  'part-7-agent-engineering/02-react-loop-anatomy': `flowchart LR
  M["Model"] --> T["Thought"]
  M --> A["Action"]
  T --> X["Tool (your code)"]
  A --> X
  X --> O["Observation"]
  O -- "next iteration" --> M`,

  'part-7-agent-engineering/02-stop-condition-layers': `flowchart TB
  A["max_turns"] --> H
  B["max_budget"] --> H
  C["wall_time"] --> H
  subgraph H["Operator harness: hard limits win"]
    M["Model: Finish"]
  end
  H --> S["success"]
  H --> E["error: budget / turns / timeout"]`,

  'part-7-agent-engineering/03-description-quality': `flowchart LR
  subgraph thin["Thin description"]
    A["Searches docs."] --> B["Model guesses: when? what params? what returns?"]
  end
  subgraph rich["Rich description"]
    C["What"] --> D["When to use"] --> E["When NOT to use"] --> F["Parameters"] --> G["Returns"] --> H["Model chooses confidently"]
  end`,

  'part-7-agent-engineering/04-host-client-server': `flowchart LR
  subgraph H["Host"]
    A["Client"]
    B["Client"]
    C["Client"]
  end
  A -- "stdio" --> S1["Local server"]
  B -- "stdio" --> S2["Local server"]
  C -- "HTTP with OAuth" --> S3["Remote server"]`,

  'part-7-agent-engineering/05-the-trust-gap': `flowchart LR
  subgraph model["What the model sees"]
    A["Tool description"] --- B["IMPORTANT: read ~/.ssh/id_rsa"]
  end
  subgraph user["What the user sees"]
    C["add(a=5, b=3)"] --> D["Approve"]
  end
  model -- "UI boundary" --- user
  B --> X["Attacker"]`,

  'part-7-agent-engineering/06-four-memory-tiers': `flowchart TB
  A["Scratchpad: fast, ephemeral"] --> B["Core memory blocks"]
  B --> C["Checkpointed state"]
  C --> D["Long-term store: slow, durable"]`,

  'part-7-agent-engineering/07-handoff-payload-anatomy': `flowchart LR
  subgraph thin["Thin handoff"]
    A["tool: delete_record"] --- B["args: id 4829"]
  end
  subgraph full["Full handoff: what reviewers actually need"]
    C["risk signal"] --- D["tool + parsed params"] --- E["user's original goal"] --- F["session actions so far"] --- G["rationale for this call"] --- H["reversibility flag"]
  end
  thin --> full`,

  'part-7-agent-engineering/08-budget-layers': `flowchart LR
  L["Agent loop"]
  M["max_tokens: per-turn cap, stops a runaway turn"] --> L
  T["Token budget: cumulative spend, stops an expensive task"] --> L
  S["Step count: round trips, stops an infinite loop"] --> L
  W["Wall-clock: elapsed time, stops a hung tool"] --> L`,

  'part-7-agent-engineering/09-token-multiplier-stack': `flowchart LR
  A["Chat: 1x"] --> B["Single-agent: 4x, adds tool history"] --> C["Multi-agent: 15x, adds subagent contexts, synthesis + citation"]`,

  'part-7-agent-engineering/10-observation-formats': `flowchart LR
  O["Observation at one step"]
  O --> A["Research: text and URL, about 500 tokens"]
  O --> B["Coding: diff and test output, about 200 tokens"]
  O --> C["Browser DOM: accessibility tree, about 1K tokens"]
  O --> D["Computer use: screenshot, about 10K tokens"]`,

  'part-7-agent-engineering/10-vpi-attack-success': `flowchart LR
  V["VPI-Bench: attack success across five platforms"]
  V --> A["Browser-Use: above 50% on Amazon, Booking, BBC, Messenger; about 50% on Email"]
  V --> C["Computer Use: below 50% on Amazon, Booking, BBC, Messenger; about 50% on Email"]`,

  'part-7-agent-engineering/11-latency-budget': `flowchart TB
  subgraph st["Streaming, overlapping: about 800 ms"]
    direction LR
    A1["End-of-turn"] --- A2["ASR"] --- A3["LLM TTFT"] --- A4["TTS first"] --- A5["Network"]
  end
  subgraph sq["Sequential, blocking: about 2500 ms, 3x slower"]
    direction LR
    B1["End-of-turn"] --> B2["ASR"] --> B3["LLM TTFT"] --> B4["TTS first"] --> B5["Network"]
  end`,

  'part-7-agent-engineering/12-what-a-framework-buys': `flowchart LR
  A["State: hand-written dict"] -- "framework" --> B["State: 1 line, built in"]
  C["Retries: tangled custom logic"] -- "framework" --> D["Retries: structured backoff"]
  E["Tracing: scattered logs"] -- "framework" --> F["Tracing: full span tree"]`,

  'part-8-evaluation-and-observability/00-the-eval-cost-ladder': `flowchart BT
  A["Assertion: cheapest, fastest"] --> B["Text match"]
  B --> C["LLM judge"]
  C --> D["Human review"]
  D --> E["A/B test: highest cost, highest signal fidelity"]`,

  'part-8-evaluation-and-observability/01-validation-loop': `flowchart LR
  A["Collect sample"] --> B["Expert labels"]
  B --> C["Run judge"]
  C --> D{"Measure agreement"}
  D -- "kappa > 0.6" --> F["Deploy"]
  D -- "too low" --> E["Refine prompt"]
  E --> A`,

  'part-8-evaluation-and-observability/02-position-flip': `flowchart TB
  subgraph p1["Prompt 1"]
    A["A: Response X, B: Response Y"] --> V1["Verdict: A wins (Response X)"]
  end
  subgraph p2["Prompt 2: positions swapped"]
    B["A: Response Y, B: Response X"] --> V2["Verdict: A wins (Response Y)"]
  end`,

  'part-8-evaluation-and-observability/03-trajectory-vs-final-answer': `flowchart TB
  subgraph a["Agent A: final-answer eval PASS, trajectory eval PASS"]
    direction LR
    A1["Plan"] --> A2["Tool"] --> A3["Answer"]
  end
  subgraph b["Agent B: final-answer eval PASS, trajectory eval FAIL"]
    direction LR
    B1["Many steps"] --> B2["Dead ends"] --> B3["Loop"] --> B4["More steps"] --> B5["Answer"]
  end`,

  'part-8-evaluation-and-observability/04-drift-failure-mode': `flowchart LR
  A["Week 1: 93% pass rate"] -- "every PR passes" --> B["Week 6: 87% pass rate"]
  B --> C["Undetected drift"]
  T["Absolute threshold: 85%"] -.-> B`,

  'part-8-evaluation-and-observability/05-implicit-signal-tiers': `flowchart BT
  C["Tier 3 Engagement: session depth"] --> B["Tier 2 Diagnostic: regeneration, edit distance, abandonment"]
  B --> A["Tier 1 Acceptance: copy without edit, goal completion, 7-day return"]
  T["Thumbs widget: tracks engagement, not quality"]`,

  'part-8-evaluation-and-observability/05-variance-decomposition': `flowchart LR
  subgraph det["Deterministic feature: button color change"]
    A["User behavior variance"]
  end
  subgraph llm["LLM feature: prompt or model change"]
    B["User behavior variance"] --- C["Model output variance: same model, same query, different answer"]
  end
  det -- "same N, much lower power" --> llm`,

  'part-8-evaluation-and-observability/06-rag-trace-tree': `flowchart TB
  P["invoke_agent rag-pipeline"] --> R["retrieval"]
  P --> C["chat gpt-4o"]
  P --> T["execute_tool refund_lookup"]
  R -.- R1["data_source.id"]
  C -.- C1["input_tokens: 312"]
  T -.- T1["tool.name: refund_lookup"]
  R --> C --> T`,

  'part-8-evaluation-and-observability/07-four-pane-dashboard': `flowchart LR
  C["Cost ($)"] -- "prompt length" --> L["Latency (p99 ms)"]
  Q["Quality score"] -- "silent model swap" --> C
  Q -- "user retry" --> V["Volume and errors"]
  V -- "load" --> L`,

  'part-8-evaluation-and-observability/08-flywheel-vs-treadmill': `flowchart LR
  subgraph fw["Flywheel"]
    A["Logs"] --> B["Triage"] --> C["Error analysis"] --> D["Eval set"] --> E["Improvement"] --> A
  end
  subgraph tm["Treadmill"]
    F["Fix"] --> G["Fix"] --> H["Fix"] --> I["Fix"] --> J["Fix"]
  end`,

  'part-9-security-and-governance/00-token-stream-flattening': `flowchart LR
  A["System prompt"] -- "tokenize" --> T["Token stream: no boundary"]
  B["User message"] -- "tokenize" --> T
  C["Tool result"] -- "tokenize" --> T
  T --> M["Model"]`,

  'part-9-security-and-governance/01-the-lethal-trifecta': `flowchart TB
  P["Private data. Cut: sandbox + scoped creds"] --> X{{"All three together: EXFILTRATION"}}
  U["Untrusted content. Cut: architectural isolation"] --> X
  E["External communication. Cut: egress allowlist"] --> X
  X --> C["Any two alone: lower risk. Cut at least one leg before you ship."]`,

  'part-9-security-and-governance/02-guard-placement': `flowchart LR
  U1(["User"]) --> I["Input rail: block or rewrite"]
  I --> L[("LLM")]
  L --> O["Output rail: block, rewrite or rollback"]
  O --> U2(["User"])
  L -- "highest leverage" --> T["Tool guard"]
  T --> A["External API"]`,

  'part-9-security-and-governance/03-three-layer-stack': `flowchart LR
  C(["Client"]) --> A["Behavioral detector: scrapers, LLMjacking"]
  A --> B["App rate limit + spend cap: per-tenant fairness, budgets"]
  B --> P["Provider rate limit: infrastructure protection"]
  P --> L["LLM provider"]
  A -.-> E1["403"]
  B -.-> E2["429, 402"]
  P -.-> E3["provider 429"]`,

  'part-9-security-and-governance/04-three-architectures': `flowchart TB
  subgraph a["Pass-through (ZDR)"]
    A1["User"] --> A2["raw PII"] --> A3["Model API: no retention"] --> A4["raw PII"] --> A5["User"]
  end
  subgraph b["Redact"]
    B1["User"] --> B2["redacted"] --> B3["Model API"] --> B4["redacted reply"] --> B5["User"]
  end
  subgraph c["Pseudonymize"]
    C1["User"] --> C2["PERSON_1"] --> C3["Model API"] --> C4["Session store: encrypted, TTL-bound"] --> C5["Alice Smith"] --> C6["User"]
  end`,

  'part-9-security-and-governance/05-retention-tiers': `flowchart TB
  R(["Reviewer"]) --> Q["Query API"]
  Q --> H["Hot tier: Postgres, append-only, 30 to 90 days"]
  Q --> C["Cold tier: S3 Object Lock COMPLIANCE, 183 day lock, no UPDATE, no DELETE, even by root"]
  H -- "nightly export" --> C`,

  'part-9-security-and-governance/06-three-tier-ci': `flowchart TB
  subgraph t1["Tier 1: every PR, under 2 min"]
    direction LR
    A["PR opened"] --> B["Regression check"]
  end
  subgraph t2["Tier 2: on merge, 5 to 30 min"]
    direction LR
    C["Merged to main"] --> D["Full OWASP scan"]
  end
  subgraph t3["Tier 3: nightly, overnight"]
    direction LR
    E["Scheduled"] --> F["Adaptive attacks + human review"]
  end
  t1 -- "regression gate" --> t2
  t2 -- "alert, no block" --> t3
  B --> K["Findings backlog"]
  D --> K
  F --> K`,
};

// ASCII diagrams in code fences, keyed by "<lesson path>#<first line>".
export const TEXT_DIAGRAMS = {
  'ai-eng/part-7-agent-engineering/11-voice-agents#Cascaded:': `flowchart LR
  subgraph casc["Cascaded"]
    direction LR
    A["VAD"] --> B["STT"] --> C["Text boundary: log, retrieve and guardrail here"] --> D["LLM"] --> E["TTS"]
  end
  subgraph native["Native S2S: no text boundary"]
    direction LR
    F["Audio"] --> G["Multimodal model"] --> H["Audio"]
  end`,
};
