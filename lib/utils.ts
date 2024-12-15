import { PriceHistoryItem, Product } from "@/types";

interface TextElement {
    text(): string;
}

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
} as const;

const THRESHOLD_PERCENTAGE = 40;

// Extracts and returns the price from a list of possible elements.
export function extractPrice(...elements: TextElement[]): string {
  for (const element of elements) {
    const priceText = element.text().trim();

    if (priceText) {
      // Remove all characters except digits, decimal points, and commas
      const cleanPrice = priceText.replace(/[^\d.,]/g, '');

      if (cleanPrice) {
        // Handle comma and decimal formats
        const normalizedPrice = cleanPrice.replace(/,/g, '');
        const numericPrice = parseFloat(normalizedPrice);

        if (!isNaN(numericPrice)) {
          // Format the number to avoid extra decimal places
          return numericPrice.toFixed(2);
        }
      }
    }
  }

  return '';
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: TextElement) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/^\D+/g, '');
};
