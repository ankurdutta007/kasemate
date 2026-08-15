async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8443/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: "some_id",
        is_initialization: true,
        persona_bio: "Former consultant and engagement manager."
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
