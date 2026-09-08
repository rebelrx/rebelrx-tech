---
title: "🧠 Self-Hosted AI"
description: >-
  Build a practical local AI environment for LLM inference, voice assistants, research and coding, autonomous agents, image generation, and private automation.
---
Self-hosting AI is one of the most compelling uses for modern homelab hardware. It can keep sensitive prompts and documents local, reduce dependence on hosted services, make large open models genuinely useful, and let you build workflows that would be awkward or expensive in the cloud.

But a useful AI lab is not a pile of models and GPUs.

The goal is to build a **real system**: fast local inference, a voice path that works every day, coding and research tools that can use the web when needed, an agent that can orchestrate longer jobs, and enough separation between components that one upgrade does not take everything down.

---

## 🧭 Core Principle

> Treat AI as infrastructure: keep the model layer replaceable, keep your data under your control, and assign each workload to the tool that is best at it.

A good local AI stack should not depend on one model, one frontend, one runtime, or even one machine.

---

## 🧱 Think in Layers, Not Products

A practical local AI environment usually contains several distinct layers:

```text
User interfaces
    ↓
Voice / chat / coding / agent interfaces
    ↓
Agent and application layer
    ↓
OpenAI-compatible inference APIs
    ↓
Ollama / llama.cpp / vLLM
    ↓
GPU / CPU compute
    ↓
Local NVMe model storage
```

Alongside that core path are specialized services:

```text
Speech-to-text
Text-to-speech
Embeddings
Reranking
Image generation
Web search
Web extraction
Browser automation
Document retrieval
```

Keeping those functions separate makes the environment much easier to upgrade and troubleshoot.

---

## 🏗️ A Real-World Local AI Stack

For a capable homelab, I recommend dividing AI into four practical workloads.

### Interactive AI

Used for:

- General chat
- Summarization
- Local document questions
- Quick reasoning
- Home automation requests

Characteristics:

- Low latency matters
- One or two concurrent users
- Privacy matters
- Models should remain loaded when possible

A simple runtime such as **Ollama** is often ideal here to start with.

### Research and coding

Used for:

- Repository analysis
- Shell assistance
- Code generation
- Long-context debugging
- Web research
- Document synthesis

Characteristics:

- Larger context windows
- Strong tool calling
- Web access may be required
- Long-running tasks are acceptable

This workload can use the same inference server as interactive chat, but it often benefits from a larger or more capable model.

### Agentic workflows

Used for:

- Multi-step research
- Browser automation
- Scheduled work
- Coding tasks
- Delegation to other models/tools
- Persistent memory and skills

This is where an agent framework such as **Hermes Agent** belongs.

### Voice assistant

Used for:

- Speech recognition
- Home Assistant interaction
- Conversational queries
- Spoken responses

The ideal path is modular:

```text
Microphone
   ↓
Speech-to-text
   ↓
Intent / LLM
   ↓
Home automation or answer
   ↓
Text-to-speech
   ↓
Speaker
```

No single part of that chain should be irreplaceable.

---

## 🖥️ Hardware Roles

A mature setup benefits from assigning hardware by role rather than letting every machine do everything.

A typical design might look like:

```text
Primary GPU workstation
  ├─ Large LLM inference
  ├─ Image generation
  ├─ Speech models
  └─ Embeddings

Agent / orchestration node
  ├─ Hermes Agent
  ├─ Browser automation
  ├─ Search and scraping
  └─ Development tools

General-purpose server
  ├─ Web frontends
  ├─ Databases
  ├─ RAG applications
  └─ Supporting APIs

NAS
  ├─ Archived models
  ├─ Datasets
  ├─ Documents
  └─ Backups
```

This separation prevents a large image-generation workload or agent experiment from destabilizing core services.

---

## 💾 Model Storage Strategy

Modern AI models consume storage surprisingly quickly.

Use **fast local NVMe** for models that are actively served. Use NAS or archival storage for models you want to keep but do not need loaded regularly.

A useful inventory records:

- Model name
- Model family/version
- Quantization
- File format
- Source
- License
- Context window
- Approximate VRAM/RAM requirement
- Runtime
- Intended use

Do not turn model storage into an uncurated landfill. If you have not used a model in months and it is readily downloadable again, deleting it is often the correct decision.

---

## ⚙️ Ollama vs llama.cpp vs vLLM

The three most useful local inference choices are not interchangeable. They optimize for different priorities.

| Runtime | Best for | Model ecosystem | Ease of use | Throughput | Hardware flexibility |
|---|---|---|---:|---:|---:|
| **Ollama** | Everyday local AI and integrations | Ollama models / GGUF-backed packaging | Excellent | Good | Good |
| **llama.cpp** | Maximum control and portable GGUF inference | GGUF | Moderate | Good | Excellent |
| **vLLM** | High-throughput GPU serving | Hugging Face / safetensors | Moderate | Excellent | GPU-focused |

There is no universal winner.

---

## 🦙 Ollama

Ollama is the easiest default for most homelabs.

It handles model management, downloading, serving, GPU placement, and an OpenAI-compatible API behind a very simple CLI.

Install Ollama using its [official installation instructions](https://docs.ollama.com/), then run a model:

```bash
ollama pull <model>
ollama run <model>
```

List installed models:

```bash
ollama list
```

See what is currently loaded and whether it is running on GPU or CPU:

```bash
ollama ps
```

The OpenAI-compatible API is normally available beneath:

```text
http://localhost:11434/v1
```

### When Ollama is the right choice

Use Ollama when you want:

- Fast setup
- Easy model switching
- Simple model lifecycle management
- Good desktop/homelab integration
- An OpenAI-compatible API
- Minimal operational overhead

It is particularly good for:

- Open WebUI
- Home Assistant integrations
- Local coding assistants
- Hermes
- Small-team or household inference

### Context length matters

Agentic workloads and coding tools often require much more context than a simple chat session.

Do not assume the runtime is using the model's full advertised context window.

Current Ollama versions can choose context length based on available VRAM, and it can also be explicitly configured. For agent or coding workloads, **64K or more** is a useful target when the model and hardware support it.

For example:

```bash
OLLAMA_CONTEXT_LENGTH=65536 ollama serve
```

Larger context windows increase memory consumption, so verify GPU residency afterward:

```bash
ollama ps
```

---

## 🧩 llama.cpp

`llama.cpp` is the most flexible choice when you want direct control over GGUF inference.

It supports CPU inference, GPU offload, mixed CPU/GPU configurations, multiple hardware backends, quantized models, embeddings, reranking, tool calling, speculative decoding, and an OpenAI-compatible HTTP server.

A basic local server looks like:

```bash
llama-server \
  -m /path/to/model.gguf \
  --host 127.0.0.1 \
  --port 8080
```

Or, with a model hosted on Hugging Face:

```bash
llama-server -hf <repository/model>
```

### When llama.cpp is the right choice

Use llama.cpp when you want:

- Fine-grained control
- GGUF models directly
- CPU-only inference
- Partial GPU offload
- Unusual hardware support
- Aggressive quantization
- A minimal runtime
- Detailed tuning and benchmarking

It is also excellent for machines where GPU memory is limited but system RAM is plentiful.

### Why not use it for everything?

You absolutely can, but you take on more operational responsibility.

Ollama wraps many of the model-management details that llama.cpp intentionally exposes. If you do not need those controls, the extra knobs may simply create work.

---

## 🚀 vLLM

vLLM is designed primarily as a **high-performance model-serving engine** rather than a desktop model manager.

It is particularly strong when:

- Multiple clients use the same model
- Throughput matters more than simplicity
- Large Hugging Face models are served directly
- You have one or more powerful GPUs
- Tensor/data/expert parallel deployment matters

A basic OpenAI-compatible server looks like:

```bash
vllm serve <model> \
  --host 127.0.0.1 \
  --port 8000
```

The API then behaves similarly to an OpenAI-compatible backend:

```text
http://localhost:8000/v1
```

### When vLLM is the right choice

Use vLLM when you want:

- High request throughput
- Efficient batching
- Multiple simultaneous users or agents
- Large GPU-resident models
- Tensor parallelism
- Data parallelism
- Production-style model serving

### Why not use vLLM everywhere?

For a single household user who changes models frequently, vLLM can be more infrastructure than you need.

It shines when the model server behaves like a **shared inference appliance**.

---

## 🧠 Which Runtime Should You Pick?

A useful decision tree is:

```text
Do you want the easiest local experience?
    └─ Yes → Ollama

Do you need direct GGUF / CPU / unusual hardware control?
    └─ Yes → llama.cpp

Are you serving one large model to many clients or agents?
    └─ Yes → vLLM
```

For many advanced homelabs the correct answer is actually **more than one**.

For example:

```text
Ollama
  → interactive models and integrations

vLLM
  → high-throughput large model endpoint

llama.cpp
  → experimental GGUF builds or specialized hardware
```

Because all three can expose broadly OpenAI-compatible interfaces, applications above them can remain relatively portable. Compatibility is partial: test chat templates, tool calls, structured output, streaming, and context limits against the exact runtime/model combination.

---

## 🔌 Standardize on APIs, Not Runtimes

Whenever possible, connect applications through an OpenAI-compatible endpoint rather than runtime-specific code.

Conceptually:

```text
Applications
     ↓
OpenAI-compatible API
     ↓
┌──────────┬───────────┬─────────┐
│  Ollama  │ llama.cpp │  vLLM   │
└──────────┴───────────┴─────────┘
```

That makes it much easier to replace a backend later.

---

## 🗣️ Building a Local Voice Assistant

A local voice assistant is one of the best examples of why modularity matters.

A practical pipeline is:

```text
Wake word / microphone
        ↓
Speech-to-text
        ↓
Home Assistant voice pipeline
        ↓
Local LLM when needed
        ↓
Intent / automation
        ↓
Text-to-speech
        ↓
Speaker
```

The Home Assistant layer can handle deterministic home-control requests while the LLM handles conversational or ambiguous requests.

This avoids sending every simple command through a large language model.

---

## 🎙️ Speech-to-Text

Local speech recognition keeps raw microphone audio within your environment.

Useful model families include:

- Whisper-derived models
- NVIDIA NeMo / Parakeet-family models

Prioritize:

- Accuracy on actual household speech
- Latency
- Streaming behavior
- GPU memory use
- Home Assistant/Wyoming compatibility

For a home assistant, shaving a few hundred milliseconds from latency often improves usability more than chasing a marginal benchmark improvement.

---

## 🔊 Text-to-Speech

Local TTS gives predictable latency and avoids sending every response to a third party.

Useful options include:

- **Kokoro**-based services
- **Piper**

Kokoro is attractive when voice quality is the priority. Piper remains useful when lightweight operation and broad compatibility matter most.

A Wyoming adapter can make an OpenAI-style or custom TTS service available to Home Assistant without coupling Home Assistant directly to the underlying engine.

---

## 🏠 Home Assistant Integration

A good architecture keeps Home Assistant responsible for automation and device control while AI services provide intelligence around it.

Avoid granting a general-purpose LLM unrestricted control over the entire Home Assistant API.

Prefer:

- Explicit intents
- Scoped entities
- Narrow tool permissions
- Read-only access where possible
- Confirmation for destructive actions

AI should augment deterministic automation, not replace it.

---

## 💻 Coding with Local Models

Coding is one of the strongest local LLM workloads because source code can remain private.

Useful capabilities include:

- Repository-aware chat
- Refactoring
- Code explanation
- Test generation
- Shell assistance
- Documentation generation
- Debugging

For coding, prioritize:

- Large context
- Reliable tool use
- Strong code benchmarks
- Fast prompt ingestion
- Good instruction following

A slightly smaller model with a large usable context window is often more productive than a much larger model with slow prompt processing.

---

## 🔎 Local Research Workflows

A model cannot perform current research by itself. It needs tools.

A real research pipeline may look like:

```text
Hermes Agent
   ↓
Search engine
   ↓
Web extractor
   ↓
Browser automation when needed
   ↓
LLM synthesis
   ↓
Citations / saved output
```

A fully local or mostly self-hosted implementation might combine:

- **SearXNG** for search
- **Firecrawl** for web extraction
- A browser automation service for difficult pages
- A local LLM endpoint
- Hermes for orchestration

The model is only one part of the research system.

---

## 🤖 Hermes Agent

[Hermes Agent](https://github.com/NousResearch/hermes-agent) from Nous Research is a powerful agent framework that can operate locally while using either local or hosted models.

It is designed for more than chat. Hermes can work with tools, persistent memory, skills, terminal access, browser capabilities, scheduled tasks, messaging gateways, and multiple model providers.

For a homelab, this makes Hermes useful as a dedicated **AI orchestration layer**.

---

## 🦞 What About OpenClaw?

[OpenClaw](https://openclaw.ai/) is another major self-hosted personal-assistant/agent platform and is absolutely worth knowing about.

Its strengths include:

- Messaging integrations
- Persistent personal-assistant workflows
- Multi-agent routing
- A gateway architecture
- Cross-platform clients
- Local and hosted model support

OpenClaw and Hermes overlap, but they are not identical products.

For this guide, I use **Hermes** as the implementation example because it fits especially well as a research/coding/orchestration agent and exposes a straightforward path to local OpenAI-compatible inference.

If you are already using OpenClaw, Hermes also includes migration tooling for importing supported OpenClaw settings and user data.

---

## 📦 Installing Hermes Agent

On Linux, macOS, or WSL2, the upstream installer is:

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

For a persistent agent, create and switch to the dedicated account in the next section **before** installing. Run the installer once under that account. Review downloaded installers before execution.

Open a new shell, or reload the appropriate startup file (Bash shown):

```bash
source ~/.bashrc
```

Then run the setup wizard:

```bash
hermes setup
```

Useful commands include:

```bash
hermes
hermes model
hermes tools
hermes doctor
```

`hermes` starts the interactive interface, while `hermes model` lets you configure or switch inference providers.

---

## 👤 Use a Dedicated Hermes Account

For a persistent agent node, I prefer running Hermes under its own unprivileged Linux account rather than your everyday administrator account.

For example:

```bash
sudo adduser hermes
```

Then switch to it:

```bash
sudo -iu hermes
```

Install Hermes as that user:

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

This creates a useful security boundary between the agent and the rest of the host.

Do not run a general-purpose autonomous agent as root.

---

## 📁 Hermes Data Layout

A normal per-user Hermes installation keeps its data beneath:

```text
~/.hermes/
```

Important locations include:

```text
~/.hermes/config.yaml
~/.hermes/.env
~/.hermes/skills/
~/.hermes/profiles/
~/.hermes/state.db
~/.hermes/sessions/
~/.hermes/logs/
```

Treat this directory as application state.

The configuration file and secret environment file serve different purposes: do not casually copy secrets into public configuration examples or Git repositories.

---

## 🔗 Connect Hermes to a Local Ollama Server

Hermes supports custom OpenAI-compatible endpoints, including Ollama, llama.cpp, vLLM, and similar servers.

First make sure the model server is reachable from the Hermes node.

Then run:

```bash
hermes model
```

Choose the custom/self-hosted endpoint option.

For Ollama, the base URL has the form:

```text
http://<ai-server>:11434/v1
```

Then enter the exact Ollama model name.

You can obtain installed model names with:

```bash
ollama list
```

Do **not** publish your private hostname or IP in documentation; use a generic endpoint placeholder as shown above.

---

## 📚 Hermes Needs a Large Context Window

Hermes performs multi-step tool work and maintains substantial working context.

The [Hermes quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) specifies at least **64,000 tokens** for tool-enabled agent operation. Allocate 65,536 where the runtime/model supports it, and test actual tool calls.

If you use Ollama, make sure the runtime actually allocates that context rather than assuming the model's advertised maximum is automatically active.

For example:

```bash
OLLAMA_CONTEXT_LENGTH=65536 ollama serve
```

Set this in the environment of the **running Ollama service** and restart that service; do not launch a second server on an occupied port. Native systemd, OpenRC/sysvinit, and Docker installations need their respective service configuration. See [Ollama context configuration](https://docs.ollama.com/context-length).

Then validate the model remains fully or appropriately GPU-resident:

```bash
ollama ps
```

Longer context is not free: KV cache memory can become a major component of VRAM usage.

---

## 🧠 Choosing a Hermes Model

A Hermes model should be selected for **agent reliability**, not just conversational quality.

Prioritize:

- Tool calling
- Instruction following
- Large context
- Code competence
- JSON/structured output reliability
- Low tendency to ignore tool results

A strong reasoning or coding model often works better for Hermes than a conversational model optimized primarily for personality.

Before committing to a model, test it on tasks that require:

1. several sequential tool calls;
2. reading tool output correctly;
3. modifying a plan after failure;
4. returning a grounded final answer.

---

## 🌐 Give Hermes Research Tools

A local model alone cannot search the current web.

For a self-hosted research stack, connect Hermes to appropriate search and extraction services.

A practical architecture is:

```text
Hermes
  ├─ Search → SearXNG
  ├─ Extraction → Firecrawl
  ├─ Browser → browser automation
  └─ Model → local OpenAI-compatible endpoint
```

Installing these services does not connect them to Hermes automatically. Use the installed version's [tools configuration](https://hermes-agent.nousresearch.com/docs/user-guide/features/tools) or a reviewed MCP integration, confirm each endpoint/authentication setting, and execute a real search and extraction test. Search still contacts external engines, and retrieved pages are untrusted input.

The important distinction is:

- **search** discovers candidate sources;
- **extraction** retrieves readable content;
- **browser automation** handles interactive or difficult sites.

Do not confuse those functions.

---

## 🧰 Hermes Skills and Tools

Hermes supports tools and reusable skills.

Use them to encode procedures you want the agent to execute consistently, such as:

- Research workflows
- Code-review steps
- Repository maintenance
- Documentation generation
- Scheduled reporting
- API interactions

Treat skills as code.

Review them before installation and version-control your own skills where appropriate.

---

## 👥 Hermes Profiles

Profiles are useful when one Hermes installation needs multiple operating modes.

For example:

```text
Default
  → general research and automation

Coding
  → code-focused model and development tools

Local
  → fully local model endpoint

Cloud
  → frontier hosted model for difficult tasks
```

This is preferable to constantly rewriting one global configuration.

---

## 💬 Optional Hermes Messaging Gateway

After CLI inference and tools work, configure only the messaging platform you need:

```bash
hermes gateway setup
hermes gateway
```

The second command runs in the foreground for testing. Restrict authorized users and review tool permissions before leaving it online.

On Linux **with systemd**, the upstream service workflow is:

```bash
hermes gateway install
hermes gateway start
hermes gateway status
```

Use the [gateway documentation](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/) for logout/boot persistence. On Devuan or Artix without systemd, use a deliberately configured supervisor running as the unprivileged agent account; the systemd installation commands are not an init-neutral recipe.

For OpenClaw migration, back up both applications first, inspect `hermes --help` for migration options in your installed release, and review supported import fields before running them. An import is not proof that credentials, tools, or message routing are configured safely.

---

## 🔀 Hybrid Local + Cloud Agents

Running Hermes locally does not require every inference request to be local.

A strong architecture can use:

```text
Local model
  → routine work, private data, inexpensive tasks

Hosted model
  → unusually difficult reasoning or large-context work
```

The agent framework remains under your control even when selected inference calls use an external provider.

The privacy boundary should be explicit: do not silently route sensitive work to a cloud model.

---

## 🛡️ Agent Security

An agent with shell access is fundamentally different from a chatbot.

The model can potentially:

- Execute commands
- Read files
- Modify repositories
- Browse authenticated services
- Call APIs
- Delete data

Use operating-system boundaries as real security controls.

Prefer:

- Dedicated unprivileged user
- Limited filesystem access
- Separate working directories
- Dedicated credentials
- Scoped API tokens
- Explicit command approval
- Sandboxing or containers where useful
- Backups before allowing write access to important data

Never assume the LLM itself is a security boundary.

---

## 🚫 Do Not Give an Agent Everything

Avoid giving a general-purpose agent:

- Root access
- Your password manager vault
- Private SSH keys for the entire network
- Unrestricted NAS write access
- Cryptocurrency recovery seeds
- Production secrets it does not need

If a task needs privileged action, use a narrowly scoped mechanism rather than handing the agent administrator credentials.

---

## 🌐 Agent Network Access

Agents should be able to reach what they need—but not everything simply because it is convenient.

Consider separating:

```text
Inference access
Research/web access
Internal service access
Administrative access
```

A research agent may need the public web and an inference endpoint but no access to storage administration or infrastructure control planes.

---

## 🖼️ Image Generation with ComfyUI

ComfyUI remains one of the best local image-generation environments because the workflow graph makes the entire pipeline visible and reproducible.

Keep these separate:

```text
models/
workflows/
outputs/
```

Persist workflows outside ephemeral containers.

For large FLUX-class or video-generation pipelines, plan around:

- VRAM
- System RAM
- Model-load time
- Storage bandwidth
- Temporary disk use

Image generation can consume GPU memory aggressively, so it is often worth assigning it a dedicated GPU on multi-GPU systems.

---

## 🎮 Multi-GPU Allocation

On systems with several GPUs, explicit workload ownership prevents contention.

For example:

```text
GPU 0
  → LLM inference
  → speech services

GPU 1
  → ComfyUI
  → image/video generation
```

Or dedicate both GPUs to one very large model when tensor/model splitting provides a meaningful benefit.

There is no universal correct split. Measure your actual workloads.

---

## 📊 Measure Instead of Guessing

Useful metrics include:

- GPU utilization
- VRAM utilization
- GPU temperature
- Power draw
- Prompt-processing speed
- Generation speed
- Time to first token
- Context length
- Model load time
- CPU RAM
- Storage throughput

For NVIDIA systems:

```bash
nvidia-smi
```

For Ollama:

```bash
ollama ps
```

Benchmark the tasks you actually perform rather than choosing a runtime based on synthetic leaderboards alone.

---

## 🧮 Quantization

Quantization reduces memory consumption and can make much larger models practical on local hardware.

But lower precision can affect:

- Reasoning quality
- Tool calling
- Coding accuracy
- Long-context reliability

Do not automatically choose the smallest quantization that runs.

For important agent workloads, a higher-quality quantization can be worth the additional VRAM.

---

## 📚 Embeddings and Retrieval

Embeddings are useful for:

- Semantic document search
- RAG
- Similarity matching
- Clustering
- Knowledge-base retrieval

Keep the embedding model separate from the chat model.

A good architecture is:

```text
Documents
   ↓
Chunking
   ↓
Embedding model
   ↓
Vector index
   ↓
Relevant passages
   ↓
LLM
```

This allows the embedding and generation models to be upgraded independently.

---

## 🧠 RAG Is Not Memory

Retrieval-augmented generation and agent memory solve different problems.

**RAG** answers:

> What information in this corpus is relevant to the current question?

**Agent memory** answers:

> What should this agent remember about previous work, preferences, or state?

Treat them as separate systems.

---

## 🗃️ Model Backups

AI models are often reproducible downloads, but that does not mean every model needs to be downloaded again after a failure.

Back up or archive models when:

- Download time is substantial
- The model may disappear
- You created the quantization yourself
- Licensing/access may change
- The model is part of a critical workflow

For easily reproducible public models, keeping a manifest may be more valuable than backing up every byte.

---

## 🧰 Containers vs Native Install

Containers are excellent for AI services when:

- GPU runtime support is stable
- Dependencies are complex
- You want reproducible deployment
- Multiple versions need isolation

Native installs can still make sense for:

- Hermes on a dedicated agent host
- Hardware-specific development
- Performance debugging
- Driver experimentation
- Rapidly changing upstream tools

Do not force every AI tool into Docker merely for aesthetic consistency.

---

## 🌐 Frontends Such as Open WebUI

A frontend can provide:

- Chat history
- User accounts
- Model selection
- RAG
- File uploads
- Tool integration

Treat it as a separate application from the inference runtime.

Its database, uploads, configuration, and authentication require normal backup and security controls.

The frontend should be replaceable without forcing you to rebuild the model layer.

---

## 🔐 Keep AI APIs Private

Many inference engines assume a trusted environment.

Do not expose raw Ollama, llama.cpp, or vLLM endpoints directly to the public Internet.

Preferred access paths include:

- localhost
- trusted LAN
- Tailscale
- authenticated internal applications

If an endpoint must be shared more broadly, place an appropriate security layer in front of it.

Note that runtime-level API keys do not necessarily protect every diagnostic or auxiliary endpoint. Network-level controls remain important.

---

## 🔑 Keep Secrets Out of Prompts

Local inference does not make poor secret handling safe.

Do not casually paste:

- Private keys
- Recovery seeds
- Passwords
- Long-lived tokens
- Sensitive authentication material

into arbitrary AI workflows.

Agent logs, transcripts, tool traces, and application databases may retain more information than you expect.

---

## 🔄 Updates and Reproducibility

AI projects move quickly and occasionally break compatibility.

Before upgrading an important component:

1. Record the current version.
2. Save workflows and configuration.
3. Back up application state.
4. Check model/runtime compatibility.
5. Verify GPU driver requirements.
6. Test the new version before replacing a known-good deployment.

Do not treat `latest` as a stability strategy.

---

## 🧪 Validate the Entire Pipeline

A model returning tokens is not enough.

Test the real workflow.

For voice:

```text
Speak → transcription → intent → action → spoken response
```

For research:

```text
Prompt → search → source retrieval → synthesis → citation
```

For coding:

```text
Task → repository read → edit → test → review
```

For an agent:

```text
Goal → plan → tools → error recovery → verified output
```

End-to-end testing catches integration failures that component benchmarks miss.

---

## ⚡ A Practical Recommended Stack

A mature local AI homelab might use:

| Role | Example |
|---|---|
| Interactive LLM serving | Ollama |
| High-throughput model serving | vLLM when needed |
| GGUF / experimental inference | llama.cpp |
| Chat frontend | Open WebUI or equivalent |
| Agent/orchestration | Hermes Agent |
| Alternative personal agent platform | OpenClaw |
| Search | SearXNG |
| Web extraction | Firecrawl or equivalent |
| Browser automation | Dedicated browser tool/service |
| Speech-to-text | NeMo/Parakeet or Whisper-family model |
| Text-to-speech | Kokoro and/or Piper |
| Voice orchestration | Home Assistant voice pipeline |
| Image generation | ComfyUI |
| Embeddings | Dedicated embedding model |
| Model storage | Local NVMe + NAS archive |

The important word is **role**. Every product in this table can be replaced.

---

## 🪜 Start Small, Then Add Capability

Do not build the entire architecture on day one.

### Phase 1 — Local chat

```text
Ollama
  +
One strong local model
```

### Phase 2 — Useful frontend

```text
Ollama
  +
Open WebUI or another frontend
```

### Phase 3 — Voice

```text
STT
  +
Home Assistant
  +
Local LLM
  +
TTS
```

### Phase 4 — Research and coding

```text
Larger-context model
  +
Search
  +
Web extraction
  +
Coding tools
```

### Phase 5 — Agent

```text
Hermes
  +
Local inference
  +
Research tools
  +
Controlled terminal/browser access
```

### Phase 6 — Scale

Add vLLM, additional GPUs, dedicated nodes, or model routing only when your workload justifies the complexity.

---

## 🧹 What Not to Do

Avoid these common mistakes:

- Installing dozens of models without a purpose
- Exposing model APIs directly to the Internet
- Giving agents unrestricted administrator access
- Assuming the advertised context window is actually configured
- Putting active models on slow network storage
- Using a giant model for every trivial request
- Treating RAG as agent memory
- Treating a frontend as the inference engine
- Upgrading every AI component simultaneously
- Optimizing benchmark numbers instead of real workflows

---

## ✅ Recommended Baseline

For most technically advanced home users, I would start with:

```text
Fast local GPU storage
        ↓
Ollama
        ↓
OpenAI-compatible API
   ┌────┼──────────────┐
   ↓    ↓              ↓
Chat   Voice         Hermes
UI     Assistant      Agent
                        ↓
                Search / browser / tools
```

Add ComfyUI separately for image generation and add vLLM only when concurrency or throughput becomes a real requirement.

Keep llama.cpp available when you need GGUF flexibility, CPU offload, unusual hardware support, or deeper runtime control.

---

## 📚 Upstream Documentation

Because local AI tooling changes quickly, verify commands against upstream documentation before major deployments or upgrades:

- [Ollama documentation](https://docs.ollama.com/)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [vLLM documentation](https://docs.vllm.ai/)
- [Hermes Agent](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent documentation](https://hermes-agent.nousresearch.com/docs/)
- [OpenClaw](https://openclaw.ai/)

---

## 🧠 Final Thought

The best self-hosted AI environment is not the one with the most GPUs, models, or containers.

It is the one where **each workload has a purpose, every component has a clear boundary, private data stays private when it should, and no single runtime or vendor owns the entire stack**.

Start with useful local inference. Add voice when it improves daily life. Add research and coding tools when they solve real work. Add an agent such as Hermes when you are ready for AI to execute multi-step workflows rather than merely answer questions.

Then scale only when you can identify the bottleneck you are trying to remove.
