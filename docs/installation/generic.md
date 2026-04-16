# Generic Installation Guide

Using From One to Sixty-Seven with any LLM via system prompts.

---

## Overview

This guide is for AI assistants and tools not explicitly covered by specific installation guides. It covers the generic approach: using the spec as a system prompt.

**When to use this guide:**
- ChatGPT web interface
- Custom LLM API integrations
- OpenCode (ACP)
- Any LLM supporting system prompts
- Testing new AI assistants

---

## The System Prompt Approach

### What is a System Prompt?

A system prompt sets the behavior and context for an AI conversation. It's provided once at the start and influences all subsequent responses.

**Contrast with user prompts:**
- **System prompt:** "You are a helpful assistant who always provides examples."
- **User prompt:** "Explain Python dictionaries."
- **Result:** Explanation with examples

### How It Works

1. You provide `AGENTS.md` (or `CLAUDE.md`) as the system prompt
2. The AI adopts the behavioral rules specified
3. All subsequent responses follow those rules
4. No special file locations or tool integrations needed

---

## Quick Setup (2 minutes)

### Step 1: Copy the Spec

```bash
# Copy AGENTS.md (tool-agnostic version)
cp /path/to/From-One-to-Sixty-Seven/AGENTS.md ~/ai-spec.md

# Or use CLAUDE.md for more detailed rules
cp /path/to/From-One-to-Sixty-Seven/CLAUDE.md ~/ai-spec.md
```

### Step 2: Paste as System Prompt

**For APIs:**
```python
import openai

# Read spec
with open('~/ai-spec.md') as f:
    system_prompt = f.read()

# Use in API call
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Add email validation to the signup form"}
    ]
)
```

**For web interfaces:**
- Paste spec into "Custom Instructions" or "System Prompt" field
- Or prepend to your first message

---

## Using with OpenAI API

### Python Example

```python
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# Load system prompt
with open("AGENTS.md") as f:
    system_prompt = f.read()

def get_ai_response(user_message: str) -> str:
    """Get AI response with spec compliance."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.1,  # Low temperature for consistency
        max_tokens=4000
    )
    return response.choices[0].message.content

# Example usage
result = get_ai_response("Add email validation to the signup form")
print(result)
```

### JavaScript/TypeScript Example

```typescript
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = fs.readFileSync('AGENTS.md', 'utf8');

async function getAIResponse(userMessage: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.1,
    max_tokens: 4000,
  });
  
  return response.choices[0].message.content;
}
```

---

## Using with Anthropic Claude API

### Python Example

```python
import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

with open("AGENTS.md") as f:
    system_prompt = f.read()

def get_claude_response(user_message: str) -> str:
    """Get Claude response with spec compliance."""
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    return response.content[0].text

# Example
result = get_claude_response("Implement user authentication")
print(result)
```

---

## Using with OpenCode (ACP)

OpenCode (Agent Client Protocol) uses `AGENTS.md` natively:

```bash
# Place AGENTS.md in project root
cp /path/to/From-One-to-Sixty-Seven/AGENTS.md /path/to/your/project/AGENTS.md

# OpenCode reads it automatically
```

---

## Web Interface Usage

### ChatGPT (web interface)

**Option 1: Custom Instructions**
1. Go to Settings → Personalization → Custom Instructions
2. Paste AGENTS.md content into "How would you like ChatGPT to respond?"
3. Save

**Option 2: Per-conversation (no custom instructions)**
```markdown
---
[paste AGENTS.md content here]
---

Now, help me with: [your task]
```

### Claude.ai (web interface)

**Option 1: Projects (Claude Pro)**
1. Create a new Project
2. Add AGENTS.md to Project Knowledge
3. Start chats within that Project

**Option 2: Per-conversation**
```markdown
Follow these engineering rules for all responses:

[paste essential rules from AGENTS.md]

Task: [your task]
```

---

## Custom Integration Example

### Building Your Own Tool

```python
"""
Simple AI coding assistant with spec compliance.
"""

import os
from typing import Iterator
from openai import OpenAI

class SpecCompliantAssistant:
    """AI assistant that follows From One to Sixty-Seven."""
    
    def __init__(self, spec_file: str = "AGENTS.md"):
        self.client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        
        with open(spec_file) as f:
            self.system_prompt = f.read()
    
    def complete(
        self, 
        task: str,
        context: str = "",
        stream: bool = False
    ) -> str | Iterator[str]:
        """
        Get AI completion following the spec.
        
        Args:
            task: The coding task
            context: Additional context (file contents, etc.)
            stream: Whether to stream the response
        
        Returns:
            Complete response or iterator of chunks
        """
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nTask: {task}"}
        ]
        
        if stream:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.1,
                stream=True
            )
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        else:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.1,
                max_tokens=4000
            )
            return response.choices[0].message.content


# Usage
if __name__ == "__main__":
    assistant = SpecCompliantAssistant()
    
    # Simple task
    result = assistant.complete(
        task="Add email validation to the signup form",
        context="Using React with TypeScript"
    )
    print(result)
    
    # With context
    with open("src/SignupForm.tsx") as f:
        code = f.read()
    
    result = assistant.complete(
        task="Add email validation",
        context=f"Current code:\n```typescript\n{code}\n```"
    )
    print(result)
```

---

## Spec Selection

### Which File to Use?

| File | When to Use |
|------|-------------|
| **AGENTS.md** | Generic use, other LLMs, web interfaces |
| **CLAUDE.md** | Claude Code, Anthropic models |
| **CURSOR.md** | Cursor IDE |
| **COPILOT.md** | GitHub Copilot |
| **Variant files** | Specific needs (enterprise, security, etc.) |

### Adding Stack Rules

Append language-specific rules:

```bash
# Python project
cat AGENTS.md > ~/my-spec.md
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> ~/my-spec.md

# TypeScript project  
cat AGENTS.md > ~/my-spec.md
cat /path/to/From-One-to-Sixty-Seven/stacks/typescript.md >> ~/my-spec.md
```

### Adding Variants

```bash
# Enterprise requirements
cat AGENTS.md > ~/my-spec.md
cat /path/to/From-One-to-Sixty-Seven/variants/ENTERPRISE.md >> ~/my-spec.md
```

---

## Context Management

### Handling Long Conversations

**Problem:** System prompts have limited context, and long conversations drift.

**Solutions:**

1. **Refresh prompt:**
   ```python
   # After 10-15 exchanges
   messages.append({
       "role": "user", 
       "content": "Reminder: From One to Sixty-Seven spec is active. Rules: restate, minimal, verify, SUMMARY."
   })
   ```

2. **New conversation:**
   ```python
   # Start fresh with full context
   new_messages = [
       {"role": "system", "content": system_prompt},
       {"role": "user", "content": "Continuing from previous task: [restate]"}
   ]
   ```

### Optimizing Token Usage

**Spec is ~3,000 tokens.** For context-limited situations:

```bash
# Create concise version
head -50 AGENTS.md > ~/spec-concise.md

echo "Essential Rules:" >> ~/spec-concise.md
echo "1. Restate goal" >> ~/spec-concise.md
echo "2. Minimal change" >> ~/spec-concise.md
echo "3. Declare assumptions" >> ~/spec-concise.md
echo "4. Verify" >> ~/spec-concise.md
echo "5. SUMMARY block" >> ~/spec-concise.md
```

---

## Testing the Integration

### Verification Script

```python
#!/usr/bin/env python3
"""Verify spec is being followed."""

import sys
from your_assistant_module import SpecCompliantAssistant

def test_spec_compliance():
    """Test that AI follows the spec."""
    assistant = SpecCompliantAssistant()
    
    # Test 1: Goal restatement
    result = assistant.complete("Add a function to validate email addresses")
    assert "Goal" in result or "goal" in result.lower(), "Should restate goal"
    print("✓ Goal restatement: PASS")
    
    # Test 2: Assumption declaration
    result = assistant.complete(
        "Update the caching behavior",
        context="The current implementation uses Redis"
    )
    assert "ASSUMPTION" in result or "assumption" in result.lower(), "Should declare assumptions"
    print("✓ Assumption declaration: PASS")
    
    # Test 3: SUMMARY block
    result = assistant.complete("Add email validation")
    assert "SUMMARY" in result, "Should include SUMMARY block"
    assert "What changed" in result, "SUMMARY should have What changed"
    assert "Why" in result, "SUMMARY should have Why"
    print("✓ SUMMARY block: PASS")
    
    print("\nAll tests passed!")
    return True

if __name__ == "__main__":
    try:
        test_spec_compliance()
    except AssertionError as e:
        print(f"✗ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
```

---

## Best Practices

### 1. Always Include Spec

```python
# Good - spec included
messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": task}
]

# Bad - no spec
messages = [
    {"role": "user", "content": task}
]
```

### 2. Use Low Temperature

```python
temperature=0.1  # Consistent, deterministic
# vs
temperature=0.8  # Creative, random (bad for coding)
```

### 3. Handle Token Limits

```python
# Check token count (approximate)
token_count = len(system_prompt.split()) + len(task.split())
if token_count > 3000:  # Getting close to limit
    # Use concise spec or truncate context
    pass
```

### 4. Validate Output

```python
# Check for required elements
def validate_response(response: str) -> bool:
    checks = [
        "SUMMARY" in response,
        "What changed" in response or "What Changed" in response,
        "Why" in response,
    ]
    return all(checks)

result = get_ai_response(task)
if not validate_response(result):
    # Ask AI to add missing elements
    pass
```

---

## Troubleshooting

### "AI not following spec"

**Check:**
1. System prompt actually sent
2. Correct file used (AGENTS.md not CLAUDE.md for generic)
3. Temperature low enough (0.1-0.3)

**Debug:**
```python
print(f"System prompt length: {len(system_prompt)} chars")
print(f"First 200 chars: {system_prompt[:200]}")
```

### "Token limit exceeded"

**Solutions:**
1. Use concise spec version
2. Split into multiple requests
3. Reduce context provided

### "Responses too slow"

**Check:**
- Model tier (GPT-4 slower than GPT-3.5)
- Max tokens setting
- Streaming vs non-streaming

**Optimize:**
```python
# Use streaming for faster perceived response
for chunk in assistant.complete(task, stream=True):
    print(chunk, end="")
```

---

## See Also

- [Getting Started](../getting-started.md)
- [AGENTS.md](../../AGENTS.md)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)
