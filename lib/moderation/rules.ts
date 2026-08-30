const prohibited = ["weight loss","starve","self harm","gambling","bet","illegal","drink alcohol","investment return"];
export function requiresManualReview(title: string, isCustom: boolean) { const value=title.toLowerCase(); return isCustom || prohibited.some((term)=>value.includes(term)); }
