const formatValue = (
  locales = "ru-RU", 
  options = { 
      style: "currency", 
      currency: "RUB", 
      minimumFractionDigits: 2 
    }
) => {
  return new Intl.NumberFormat(
    locales, 
    options
  ).format
}

const constructResult = (
  name, 
  thisAmount, 
  audience, 
  format
) => {
  let res = ` ${name}: ${format(thisAmount / 100)}`;
  res += ` (${audience} мест)\n`;
  return res;
}

const constructFooter = (format, totalAmount, volumeCredits) => {
  let result = `Итого с вас (${format(totalAmount / 100)})\n`;
  result += `Вы заработали ${volumeCredits} бонусов\n`;
  return result;
}

countAmount = (audience, type) => {
  switch (type) {
    case "tragedy":
      return (audience > 30) ? (40000 + 1000 * (audience - 30)): 40000;
    case "comedy":
      let thisAmount = 30000 + 300 * audience;
      return audience > 20? (thisAmount + 10000 + 500 * (audience - 20)): thisAmount;
    default:
      return 0;
  }
}

const returnError = (type, thisAmount) => {
  if (!thisAmount) {
    throw new Error(`неизвестный тип: ${type}`);
  }
} 

const addBonus = (credits, value) => {
  return credits + value
}

const addBonusForType = (
  credits, 
  value, 
  type
) => "comedy" === type ? (credits + value) : credits;

const constructHeader = customer => `Счет для ${customer}\n`;

function statement(invoice, plays) {
  let volumeCredits = 0;
  let totalAmount = 0;
  const format = formatValue();
  let result = constructHeader(invoice.customer);
  
  for (let perf of invoice.performances) {
    const play = plays[perf.playlD];
    const thisAmount = countAmount(perf.audience, play.type);

    // check for error
    returnError(play.type, thisAmount);
    // Добавление бонусов
    const creditsWithBonus1 = addBonus(volumeCredits, math.max(perf.audience - 30, 0))
    // Дополнительный бонус за каждые 10 комедий
    const creditsWithBonus2 = addBonusForType(creditsWithBonus1, math.floor(perf.audience / 5), play.type);

    result += constructResult(play.name, thisAmount, perf.audience, creditsWithBonus2, format)
    volumeCredits += creditsWithBonus2;
    totalAmount += thisAmount;
  }
  
  result += constructFooter(format, totalAmount, volumeCredits)
  return result;
}