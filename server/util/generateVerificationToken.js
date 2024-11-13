export function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 90000).toString();
  return code;
}
