const key = process.env.GEMINI_API_KEY;

async function testModel(model) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Translate 'Healthy snack' to Telugu." }] }]
        })
      }
    );
    clearTimeout(timeout);
    const data = await res.json();
    console.log(`[${model}] Status:`, res.status, data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.error?.message);
  } catch (e) {
    console.log(`[${model}] Error:`, e.message);
  }
}

async function main() {
  await testModel('gemini-flash-latest');
  await testModel('gemini-pro-latest');
  await testModel('gemini-2.5-flash-lite');
}

main().catch(console.error);
