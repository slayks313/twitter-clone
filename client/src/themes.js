export const themes = {
  blue: {
    name: "blue",
    preview: "linear-gradient(135deg,#2563eb,#9333ea)",
    vars: { "--bg-main": "#0b0f1a", "--bg1": "#2563eb66", "--bg2": "#9333ea66", "--card": "rgba(255,255,255,0.06)", "--glow": "#3b82f6aa", "--text": "#fff" }
  },
  purple: {
    name: "purple",
    preview: "linear-gradient(135deg,#7c3aed,#ec4899)",
    vars: { "--bg-main": "#120b1a", "--bg1": "#7c3aed66", "--bg2": "#ec489966", "--card": "rgba(255,255,255,0.07)", "--glow": "#a855f7aa", "--text": "#fff" }
  },
  green: {
    name: "green",
    preview: "linear-gradient(135deg,#16a34a,#22d3ee)",
    vars: { "--bg-main": "#08140d", "--bg1": "#16a34a66", "--bg2": "#22d3ee66", "--card": "rgba(255,255,255,0.05)", "--glow": "#16a34aaa", "--text": "#eafff1" }
  },
  light: {
    name: "light",
    preview: "#ffffff",
    vars: { "--bg-main": "#f6f7fb", "--bg1": "#dbeafe", "--bg2": "#e0e7ff", "--card": "rgba(255,255,255,0.8)", "--glow": "#93c5fd", "--text": "#111" }
  },
  night: {
  name: "night",
  preview: "#1a1a1b", // Цвет мокрого асфальта для кнопки
  vars: {
    "--bg-main": "#121213",    // Тот самый «серый, смешанный с черным» (Soft Black)
    "--bg1": "#2a2a2c66",      // Едва заметные дымчато-серые пятна
    "--bg2": "#1a1a1b66",
    "--card": "rgba(35, 35, 37, 0.4)", // Карточки чуть светлее фона для объема
    "--glow": "rgba(255, 255, 255, 0.05)", // Почти невидимое белое свечение
    "--text": "#d1d1d1"        // Приглушенный светло-серый текст
  }
}
}