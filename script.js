// Auth0 の設定を受け取る
const domain = window.env.AUTH0_DOMAIN;
const clientId = window.env.AUTH0_CLIENT_ID;
const redirectUri = window.env.AUTH0_REDIRECT_URI;

// ログインボタンを押したときの動作
document.getElementById("loginBtn").addEventListener("click", () => {

  // OAuth2.0 Authorization Code Flow
  const url =
    `https://${domain}/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&scope=openid%20profile%20email` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=` + encodeURIComponent(crypto.randomUUID()) +
    `&nonce=` + encodeURIComponent(crypto.randomUUID()) +
    `&code_challenge_method=S256`;

  // S256 Code Challenge を作る（PKCE）
  // 非同期処理
  pkceChallenge().then(challenge => {
    const finalUrl = url + `&code_challenge=${challenge}`;
    window.location.href = finalUrl;
  });
});


// PKCE S256 チャレンジ生成
async function pkceChallenge() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  // Base64URL エンコード
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));

  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  localStorage.setItem("pkce_verifier", verifier);
  return challenge;
}
