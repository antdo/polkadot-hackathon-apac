export function toUnit(balance, decimals) {
  base = new BN(10).pow(new BN(decimals));
  dm = new BN(balance).divmod(base);
  return parseFloat(dm.div.toString() + "." + dm.mod.toString())
}