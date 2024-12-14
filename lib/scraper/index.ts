import axios from "axios";
import * as cheerio from "cheerio";
import { extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  //BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 33335;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password: password,
    },
    host: "brd.superproxy.io",
    port: port,
    rejectUnauthorized: false,
  };

  try {
    //Fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    //Extract the product title
    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice($(".a-price-whole"));
    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price"),
      $("span.a.offscreen"),
      $("#priceblock_dealprice"),
      $("#listPrice"),
      $(".a-size-base.a-color-price")
    );

    console.log({ title, currentPrice, originalPrice });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to scrape Amazon product: ${errorMessage}`);
  }
}
