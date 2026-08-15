const text = "Hello Ankur, how are you today?";
const voiceName = "en-IN-Wavenet-A";

async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8443/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName })
    });
    
    if (!res.ok) {
      console.error("HTTP Error:", res.status, await res.text());
      return;
    }
    const data = await res.json();
    console.log("Success! Audio content length:", data.audioContent?.length);
  } catch (e) {
    console.error("Network Error:", e);
  }
}
test();
