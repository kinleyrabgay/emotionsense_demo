export const emoji: Record<string, string> = {
  happy: "🔥",
  sad: "💔",
  angry: "🤬",
  surprised: "😲",
  neutral: "😐",
};

export const getEmoji = (emotion: string) => {
  return emoji[emotion.toLowerCase()] || "❓";
};
