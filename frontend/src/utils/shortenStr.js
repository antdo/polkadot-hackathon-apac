export default function shortenStr(str) {
  return `${str.slice(0, 12)}...${str.slice(-12)}`;
}