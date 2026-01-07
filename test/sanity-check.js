import fetch from "node-fetch";
const check = async () => {
    console.log("Checking http://localhost:5002/health...");
    try {
        const res = await fetch("http://localhost:5002/health");
        console.log("Status:", res.status);
        const txt = await res.text();
        console.log("Body:", txt);
    } catch (e) {
        console.error("Error:", e);
    }

    console.log("Checking http://localhost:5002/health...");
    try {
        const res = await fetch("http://localhost:5002/health");
        console.log("Status:", res.status);
        const txt = await res.text();
        console.log("Body:", txt);
    } catch (e) {
        console.error("Error on 5002:", e.message);
    }
}
check();
