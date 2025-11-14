// Auth0 の設定を受け取る
const domain = window.env.AUTH0_DOMAIN;
const clientId = window.env.AUTH0_CLIENT_ID;
const redirectUri = window.env.AUTH0_REDIRECT_URI;

// DOM が正しく読めてるか確認（ここで undefined が出たらアウト）
console.log("Auth0 domain:", domain);
console.log("Auth0 clientId:", clientId);
console.log("Auth0 redirectURI:", redirectUri);

// ログインボタン
document.getElementById("loginBtn").addEventListener("click", async () => {

  // PKCE チャレンジを先に生成（非同期）
  const challenge = await pkceChallenge();

  // Authorization Code Flow の URL を生成
  const url =
    `https://${domain}/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&scope=openid%20profile%20email` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(crypto.randomUUID())}` +
    `&nonce=${encodeURIComponent(crypto.randomUUID())}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${challenge}`;

  console.log("Redirect URL:", url);  // デバッグ表示
  window.location.href = url;
});


// PKCE Challenge 生成
async function pkceChallenge() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  // 保存して後で Token Exchange で使う
  localStorage.setItem("pkce_verifier", verifier);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );

  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return challenge;
}

