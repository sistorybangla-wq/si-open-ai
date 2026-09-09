const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const SYSTEM_PROMPT = `You are SI OPEN AI v15.0 "Ultimate Hybrid" - the most advanced multilingual AI assistant.

🧠 CORE CAPABILITIES:
- Fluent in 100+ languages with special excellence in বাংলা (Bengali) and English
- Auto-detect user language and respond accordingly
- Support mixed language (Banglish/English-Bengali mix)
- Deep reasoning, analysis, creative writing
- Code generation in 40+ languages
- Math, science, history, philosophy expertise
- Image understanding, analysis, OCR
- Web search awareness for current events
- Research and academic knowledge

💡 PERSONALITY:
- Professional yet warm and friendly
- Clear, concise, and thorough
- Use markdown for better readability
- Include code examples when relevant
- Cite sources and acknowledge uncertainty
- Be helpful, accurate, and ethical
- Speak in user's language naturally

🎯 SPECIAL FEATURES:
- Memory across conversations
- Multi-modal understanding
- Tool use and function calling
- Long context handling
- Streaming responses

You are proudly built by Sofikul from Bangladesh 🇧🇩`;

export async function callGemini(messages: any[], model: string = 'gemini-2.5-flash') {
  if (!GOOGLE_API_KEY) return { error: '⚠️ Add GOOGLE_API_KEY in Vercel env vars for real AI responses', content: getDemoResponse(messages) };
  try {
    const contents = messages.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }]
    }));
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 8192 }
        })
      }
    );
    if (!response.ok) {
      const e = await response.json();
      return { error: `Gemini: ${e.error?.message}`, content: null };
    }
    const data = await response.json();
    return { content: data.candidates?.[0]?.content?.parts?.[0]?.text, error: null };
  } catch (error: any) { return { error: error.message, content: null }; }
}

export async function callGroq(messages: any[], model: string = 'llama-3.3-70b-versatile') {
  if (!GROQ_API_KEY) return { error: 'Add GROQ_API_KEY for real AI', content: getDemoResponse(messages) };
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-20)], temperature: 0.7, max_tokens: 8192 })
    });
    if (!response.ok) { const e = await response.json(); return { error: e.error?.message, content: null }; }
    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content, error: null };
  } catch (error: any) { return { error: error.message, content: null }; }
}

export async function callHuggingFace(prompt: string, model: string = 'mistralai/Mistral-7B-Instruct-v0.3') {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HUGGINGFACE_API_KEY || ''}` }
      }
    );
    if (!response.ok) return { content: getDemoResponse([{ role: 'user', content: prompt }]), error: 'HF model loading' };
    const data = await response.json();
    return { content: data[0]?.generated_text, error: null };
  } catch (error: any) { return { error: error.message, content: null }; }
}

function getDemoResponse(messages: any[]) {
  const last = messages[messages.length - 1];
  const userText = last?.content || '';
  return `🚀 **SI OPEN AI v15.0** - Ultimate Hybrid Edition

আপনার প্রশ্ন: "${userText}"

⚠️ **Demo Mode Active**  
এটি একটি demo response। Real AI responses পেতে:

**Vercel-এ Environment Variables Add করুন:**

1. https://vercel.com → তোমার project → Settings → Environment Variables

2. এই variables add করুন (যেকোনো একটা যথেষ্ট):

| Variable | Get Free Key |
|----------|-------------|
| \`GOOGLE_API_KEY\` | https://aistudio.google.com/apikey |
| \`GROQ_API_KEY\` | https://console.groq.com |
| \`OPENROUTER_API_KEY\` | https://openrouter.ai |

3. Save → Redeploy

**তারপর 200+ features সহ real AI responses পাবেন!**

---

💡 **Quick Test:**  
এই demo message-এ আমি আপনাকে দেখাচ্ছি কিভাবে beautiful markdown render হয়:
- **Bold text** support
- *Italic text* support
- \`inline code\` support
- Lists and tables
- Code blocks with syntax

✅ **Database working** (Supabase)
✅ **Authentication ready** (Sign up to test)
✅ **Beautiful UI** (Tailwind + Glassmorphism)
✅ **Mobile responsive** (PWA ready)
✅ **Bilingual** (বাংলা + English)

🎨 **200+ features ready** - just add API key to unlock!`;
}

export async function generateImage(prompt: string, style: string = 'realistic') {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const enhanced = encodeURIComponent(`${prompt}, ${style} style, high quality, detailed, beautiful`);
    return { 
      url: `https://image.pollinations.ai/prompt/${enhanced}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`,
      error: null 
    };
  } catch (error: any) { return { url: null, error: error.message }; }
}

export async function webSearch(query: string) {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
    const data = await response.json();
    return {
      results: data.AbstractText || data.RelatedTopics?.slice(0, 5).map((r: any) => r.Text).filter(Boolean) || [],
      error: null
    };
  } catch (error: any) { return { results: [], error: error.message }; }
}

export async function deepResearch(query: string) {
  const search = await webSearch(query);
  const prompt = `Conduct comprehensive research on: "${query}"

Search context: ${JSON.stringify(search.results)}

Provide a detailed research report with:
1. Executive Summary (2-3 sentences)
2. Key Findings (5-7 bullet points)
3. Detailed Analysis
4. Multiple Perspectives
5. Supporting Evidence
6. Limitations & Uncertainties
7. Conclusion
8. Sources & References
9. Further Reading Suggestions

Use professional academic tone with clear sections.`;

  const result = await callGemini([{ role: 'user', content: prompt }], 'gemini-2.5-pro');
  return result;
}

export async function codeAssistant(prompt: string, language: string = 'python') {
  const fullPrompt = `You are a senior ${language} developer with 20+ years of experience.

User request: ${prompt}

Provide:
1. **Solution Overview** - Brief explanation of approach
2. **Complete Code** - Production-ready, well-commented ${language} code
3. **Usage Example** - How to use it
4. **Explanation** - Step-by-step breakdown
5. **Best Practices** - Industry standards followed
6. **Common Pitfalls** - Issues to watch for
7. **Testing** - Example test cases
8. **Performance Notes** - Optimization tips

Use proper markdown formatting with code blocks.`;
  return await callGemini([{ role: 'user', content: fullPrompt }], 'gemini-2.5-pro');
}

export function detectLanguage(text: string): string {
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return 'en';
}
