const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// CORS Configuration
app.use(cors());

app.use(express.json());

// Configuration Constants
const TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Retry Logic with Exponential Backoff
async function axiosWithRetry(url, config = {}, retries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: TIMEOUT,
        ...config
      });
      return response;
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Retry ${attempt + 1}/${retries} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  
  throw lastError;
}

// MAIN ROUTE - Single URL scraping
app.post("/get-price", async (req, res) => {
  const { url } = req.body;
  
  if (!url || !url.trim()) {
    return res.status(400).json({ error: "No URL provided" });
  }
  
  try {
    if (url.includes("amazon")) {
      return scrapeAmazon(url, res);
    } else if (url.includes("flipkart")) {
      return scrapeFlipkart(url, res);
    } else if (url.includes("snapdeal")) {
      return scrapeSnapdeal(url, res);
    } else {
      return res.status(400).json({ error: "Website not supported" });
    }
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
});

// =============== AMAZON SCRAPER ===============
async function scrapeAmazon(url, res) {
  try {
    const response = await axiosWithRetry(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      }
    });
    
    const $ = cheerio.load(response.data);
    
    let price = "Price not found";
    const priceSelectors = [
      ".a-price-whole",
      ".a-price-fraction",
      "[data-a-color='price']",
      "span.a-price",
      "[data-price]"
    ];
    
    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      if (priceText && priceText.match(/[\d,]+/)) {
        price = priceText;
        break;
      }
    }
    
    let title = "Title not found";
    const titleSelectors = [
      "#productTitle",
      "h1 span",
      "[data-feature-name='title']",
      "h1"
    ];
    
    for (const selector of titleSelectors) {
      const titleText = $(selector).first().text().trim();
      if (titleText && titleText.length > 10 && titleText.length < 500) {
        title = titleText;
        break;
      }
    }
    
    let image = "Image not found";
    const imageSelectors = [
      "#landingImage",
      "#imageBlock_feature_div img",
      "img[data-a-dynamic-image]",
      "img[alt*='product']"
    ];
    
    for (const selector of imageSelectors) {
      const src = $(selector).first().attr("src");
      if (src) {
        image = src;
        break;
      }
    }
    
    res.json({ website: "Amazon", title, price, image });
  } catch (error) {
    console.error("Amazon scraping error:", error.message);
    res.status(503).json({ error: "Amazon temporarily unavailable", details: error.message });
  }
}

// =============== FLIPKART SCRAPER ===============
async function scrapeFlipkart(url, res) {
  try {
    const response = await axiosWithRetry(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.flipkart.com/",
        "Cache-Control": "no-cache"
      }
    });
    
    const $ = cheerio.load(response.data);
    
    let price = "Price not found";
    const priceSelectors = [
      "._30jeq3._16Jk6d",
      "._30jeq3",
      "[data-qa='price']",
      ".UqFsDK",
      "div[class*='price']",
      ".rZx6O"
    ];
    
    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      if (priceText && priceText.match(/₹\s*[\d,]+/)) {
        price = priceText;
        break;
      }
    }
    
    let title = "Title not found";
    const titleSelectors = [
      ".B_NuCI",
      "[data-qa='productTitle']",
      "h1",
      "span[class*='Title']"
    ];
    
    for (const selector of titleSelectors) {
      const titleText = $(selector).first().text().trim();
      if (titleText && titleText.length > 10 && titleText.length < 500) {
        title = titleText;
        break;
      }
    }
    
    let image = "Image not found";
    const imageSelectors = [
      "._396cs4._2amPTt",
      "._396cs4",
      "[data-qa='productImage']",
      "img[alt*='product']"
    ];
    
    for (const selector of imageSelectors) {
      const src = $(selector).first().attr("src");
      if (src) {
        image = src;
        break;
      }
    }
    
    console.log("Flipkart - Title:", title, "Price:", price);
    res.json({ website: "Flipkart", title, price, image });
  } catch (error) {
    console.error("Flipkart scraping error:", error.message);
    res.status(503).json({ error: "Flipkart temporarily unavailable", details: error.message });
  }
}

// =============== SNAPDEAL SCRAPER ===============
async function scrapeSnapdeal(url, res) {
  try {
    const response = await axiosWithRetry(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    
    const $ = cheerio.load(response.data);
    
    let price = "Price not found";
    const priceSelectors = [
      ".payBlkBig",
      "#selling-price-id",
      "[data-qa='productPrice']",
      ".discountedPriceText",
      "div[class*='price']"
    ];
    
    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      if (priceText && priceText.match(/₹\s*[\d,]+/)) {
        price = priceText;
        break;
      }
    }
    
    let title = "Title not found";
    const titleSelectors = [
      "h1.pdp-e-i-head",
      ".pdp-e-i-x-title",
      "h1",
      "[data-qa='productTitle']"
    ];
    
    for (const selector of titleSelectors) {
      const titleText = $(selector).first().text().trim();
      if (titleText && titleText.length > 10 && titleText.length < 500) {
        title = titleText;
        break;
      }
    }
    
    let image = "Image not found";
    const imageSelectors = [
      "#zoompro",
      ".cloudzoom",
      "img[alt*='product']",
      "img"
    ];
    
    for (const selector of imageSelectors) {
      const src = $(selector).first().attr("src");
      if (src) {
        image = src;
        break;
      }
    }
    
    res.json({ website: "Snapdeal", title, price, image });
  } catch (error) {
    console.error("Snapdeal scraping error:", error.message);
    res.status(503).json({ error: "Snapdeal temporarily unavailable", details: error.message });
  }
}

// COMPARISON ROUTE
app.post("/compare-prices", async (req, res) => {
  const { productName, url } = req.body;
  
  if (!productName && !url) {
    return res.status(400).json({ error: "Product name or URL required" });
  }
  
  try {
    res.json({
      title: productName || "Product",
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
      prices: [],
      website: "Multiple"
    });
  }try {
    // Helper: extract number from price string
    const extractPrice = (str) => {
      if (!str) return 0;
      const m = str.match(/[\d,]+/);
      return m ? parseInt(m[0].replace(/,/g, '')) : 0;
    };
    
    // Mock prices - in real app would scrape from multiple URLs
    const prices = [
      { platform: 'Amazon', price: 13999, available: true },
      { platform: 'Flipkart', price: 13999, available: true },
      { platform: 'Snapdeal', price: 14299, available: true }
    ];
    
    res.json({
      title: productName || 'Product',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      prices: prices,
      website: 'Multiple'
    });
      } catch (error) {
    console.error('Comparison error:', error.message);
    res.status(500).json({ error: 'Could not generate comparison', details: error.message });
  
  
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
