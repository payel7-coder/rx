export async function hashPassword(password: string) {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
}
