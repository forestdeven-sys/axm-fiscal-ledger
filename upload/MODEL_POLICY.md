# Model Usage Policy for All Agents

> **CRITICAL:** This policy applies to ALL agents and subagents working on this project.

## 🚫 Forbidden Models (NEVER USE)

These models are explicitly banned from use:

| Model | Why Forbidden |
|-------|---------------|
| `google/gemini-2.0-flash-exp` | Outdated - replaced by Gemini 3 series |
| `google/gemini-2.0-flash` | Outdated - replaced by Gemini 3 series |
| `deepseek/deepseek-chat-v3` | Use v3.2 or reasoning variants instead |
| `anthropic/claude-3-5-sonnet-20241022` | Outdated - use Claude 4.5 series |
| `anthropic/claude-opus-4.6` | **NEVER use without explicit confirmation per-use** |

## ✅ Approved Models

### Default Choice
When in doubt, use: **`xiaomi/mimo-v2-flash`**

### By Task Type

| Task | Primary | Alternative |
|------|---------|-------------|
| General | `xiaomi/mimo-v2-flash` | `z-ai/glm-4.7` |
| Complex Reasoning | `z-ai/glm-4.7` | `deepseek/deepseek-v3.2-speciale` |
| Coding | `qwen/qwen3-coder-next` | `minimax/minimax-m2.1` |
| Frontend/UI | `minimax/minimax-m2.1` | `z-ai/glm-4.7-flash` |
| Fast/Cheap | `z-ai/glm-4.7-flash` | `liquid/lfm2-8b-a1b` |
| Vision | `qwen/qwen3-vl-235b-a22b-instruct` | - |
| Testing/Trivial | Any `:free` model | - |

## 🔑 API Keys

All API keys are located at:
```
/Users/deven/Projects/orchestration/subagents/.env
```

## 📚 Reference Documents

| Document | Path |
|----------|------|
| Full Model Guide | `/Users/deven/Projects/orchestration/subagents/MODEL_PREFERENCES.md` |
| Quick Reference | `/Users/deven/Projects/orchestration/subagents/MODEL_QUICKREF.md` |
| Machine-Readable Config | `/Users/deven/Projects/preferred_models.json` |

## ⚠️ Expensive Models (Ask First)

- `google/gemini-3-pro-preview`
- `GPT-5.2`
- `anthropic/claude-sonnet-4.5`
- `anthropic/claude-opus-4.6` (**strict confirmation required**)

---

**Last Updated:** 2026-02-07  
**Policy Owner:** Deven  
**Applies To:** All agents and subagents
