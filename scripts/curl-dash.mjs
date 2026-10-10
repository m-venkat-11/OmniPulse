async function check() {
  const res = await fetch("http://localhost:3000/dashboard");
  const text = await res.text();
  console.log("HAS quixel:", text.includes("quixel"));
  console.log("HAS Command Center:", text.includes("Command Center"));
  console.log("HAS Good Morning:", text.includes("Good Morning"));
  console.log("HAS 5-day streak:", text.includes("5-day streak"));
}
check().catch(console.error);
