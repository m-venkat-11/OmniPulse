const key = process.env.GEMINI_API_KEY;

async function testGenerate() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Translate '100% whole grain millet snack' to Telugu in 1 short phrase." }] }]
      })
    }
  );
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Full response:", JSON.stringify(data, null, 2));
}

testGenerate().catch(console.error);
