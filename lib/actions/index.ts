"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { PriceHistoryItem } from "@/types";

export async function scrapeAndStoreProduct(productURL: string) {
  if (!productURL) return;

  try {
    connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(productURL);

    if (!scrapedProduct) return;

    let product = {
      ...scrapedProduct,
      priceHistory: [
        {
          price: scrapedProduct.currentPrice,
          date: new Date(),
        },
      ] as PriceHistoryItem[],
    };

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: PriceHistoryItem[] = [
        ...existingProduct.priceHistory,
        {
          price: scrapedProduct.currentPrice,
          date: new Date(),
        },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape and store product: ${error.message}`);
    } else {
      throw new Error("Failed to scrape and store product: Unknown error");
    }
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();
    const product = await Product.findOne({ _id: productId });

    if (!product) return null;
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();
    const products = await Product.find();
    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}
