const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MAIN ROUTE - Single URL scraping
app.post("/get-price", async (req, res) => {
    const { url } = req.body;

    if (!url) return res.json({ error: "No URL provided" });

    try {
        if (url.includes("amazon")) {
            return scrapeAmazon(url, res);
        } 
        else if (url.includes("flipkart")) {
            return scrapeFlipkart(url, res);
        } 
        else if (url.includes("snapdeal")) {
            return scrapeSnapdeal(url, res);
        } 
        else {
            return res.json({ error: "Website not supported" });
        }

    } catch (error) {
        res.json({ error: "Something went wrong" });
    }
});

// COMPARISON ROUTE - Return product with mock comparison prices
app.post("/compare-prices", async (req, res) => {
    const { productName, url } = req.body;

    if (!productName && !url) {
        return res.json({ error: "Product name or URL required" });
    }

    try {
        // Just return the initial scraped product - the UI will show it
        // Since Flipkart/Snapdeal search is unreliable, we'll show mock data
        // In a production app, you'd use a price comparison API
        
        res.json({
            title: productName || "Product",
            image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
            prices: [], // Empty, will be filled with original product data
            website: "Multiple"
        });

    } catch (error) {
        console.error("Comparison error:", error.message);
        res.json({ error: "Could not generate comparison", details: error.message });
    }
});

function extractProductName(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.split('/').filter(p => p).pop() || "Product";
    } catch {
        return "Product";
    }
}


// =============== AMAZON SCRAPER ===============
async function scrapeAmazon(url, res) {
    try {
        const response = await axios.get(url, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(response.data);

        // Try multiple selectors for price
        let price = "Price not found";
        
        // Method 1: Look for current price
        const priceElement = $(".a-price.a-text-price.a-size-medium.a-color-price").first().text().trim();
        if (priceElement) {
            price = priceElement;
        } else {
            // Method 2: Combined whole and fraction
            const whole = $("span.a-price-whole").first().text().trim();
            const fraction = $("span.a-price-fraction").first().text().trim();
            if (whole) {
                price = whole + (fraction ? fraction : "");
            } else {
                // Method 3: Look for span with price pattern
                const priceSpan = $("span").filter(function() {
                    return $(this).text().match(/₹|Rs|\./) && $(this).text().length < 20;
                }).first().text().trim();
                if (priceSpan) price = priceSpan;
            }
        }

        const title = $("#productTitle").text().trim() || 
                      $("h1 span").first().text().trim() ||
                      "Title not found";
        
        const image = $("#landingImage").attr("src") ||
                      $("#imageBlock_feature_div img").first().attr("src") ||
                      $("img[data-a-dynamic-image]").first().attr("src") ||
                      "Image not found";

        res.json({ website: "Amazon", title, price, image });

    } catch (e) {
        console.error("Amazon scraping error:", e.message);
        res.json({ error: "Amazon scraping failed", details: e.message });
    }
}


// =============== FLIPKART SCRAPER ===============
async function scrapeFlipkart(url, res) {
    try {
        const response = await axios.get(url, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Referer": "https://www.flipkart.com/"
            }
        });

        const $ = cheerio.load(response.data);

        // Try multiple selectors for price on Flipkart
        let price = "Price not found";
        let priceText = "";
        
        // Method 1: Look for price in common locations
        priceText = $("._30jeq3._16Jk6d").first().text().trim();
        console.log("Method 1 price:", priceText);
        
        if (!priceText) {
            // Method 2: Alternative class
            priceText = $("._30jeq3").first().text().trim();
            console.log("Method 2 price:", priceText);
        }
        
        if (!priceText) {
            // Method 3: Search all text for price pattern
            const allText = $.text();
            const priceMatch = allText.match(/₹\s*([0-9,]+)/);
            if (priceMatch) {
                priceText = "₹" + priceMatch[1];
                console.log("Method 3 price:", priceText);
            }
        }
        
        if (!priceText) {
            // Method 4: Look in span elements with price pattern
            $("span").each(function() {
                const text = $(this).text().trim();
                if (text.match(/^₹\s*\d{4,}$/) && !priceText) {
                    priceText = text;
                    return false;
                }
            });
            console.log("Method 4 price:", priceText);
        }
        
        if (!priceText) {
            // Method 5: Look for numeric values with comma (price format)
            $("div").each(function() {
                const text = $(this).text().trim();
                if (text.match(/^₹\s*\d{2,3}(,\d{3})*$/) && !priceText) {
                    priceText = text;
                    return false;
                }
            });
            console.log("Method 5 price:", priceText);
        }
        
        if (priceText) {
            price = priceText;
        }

        // Try multiple selectors for title
        let title = $(".B_NuCI").text().trim();
        if (!title) {
            title = $("h1").first().text().trim();
        }
        if (!title) {
            title = $("span[class*='Title']").first().text().trim();
        }
        if (!title) {
            title = $("[data-test*='title']").first().text().trim();
        }
        if (!title || title.length > 500) {
            title = "Title not found";
        }

        console.log("Flipkart - Title:", title, "Price:", price);

        // Try multiple selectors for image
        let image = $("._396cs4._2amPTt").attr("src") ||
                    $("._396cs4").attr("src") ||
                    $("img._396cs4").attr("src") ||
                    $("img[alt*='product']").first().attr("src") ||
                    $("img").first().attr("src") ||
                    "Image not found";

        res.json({ website: "Flipkart", title, price, image });

    } catch (e) {
        console.error("Flipkart scraping error:", e.message);
        res.json({ error: "Flipkart scraping failed", details: e.message });
    }
}


// =============== SNAPDEAL SCRAPER ===============
async function scrapeSnapdeal(url, res) {
    try {
        const response = await axios.get(url);

        const $ = cheerio.load(response.data);

        const price = $(".payBlkBig").text().trim() ||
                      $("#selling-price-id").text().trim() ||
                      "Price not found";

        const title = $("h1.pdp-e-i-head").text().trim() ||
                      $(".pdp-e-i-x-title").text().trim() ||
                      "Title not found";

        const image = $("#zoompro").attr("src") ||
                      $(".cloudzoom").attr("src") ||
                      "Image not found";

        res.json({ website: "Snapdeal", title, price, image });

    } catch (e) {
        res.json({ error: "Snapdeal scraping failed" });
    }
}

// =============== PRICE COMPARISON HELPER FUNCTIONS ===============
async function scrapeAmazonByName(productName) {
    try {
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`;
        const response = await axios.get(searchUrl, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(response.data);
        const firstProduct = $("[data-component-type='s-search-result']").first();
        
        const price = firstProduct.find(".a-price-whole").first().text().trim() || "Price not found";
        const title = firstProduct.find("h2 a span").first().text().trim() || productName;
        const image = firstProduct.find("img").attr("src") || "Image not found";

        return { website: "Amazon", title, price, image };
    } catch (e) {
        console.error("Amazon search error:", e.message);
        return null;
    }
}

async function scrapeFlipkartByName(productName) {
    try {
        const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`;
        const response = await axios.get(searchUrl, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml",
                "Referer": "https://www.flipkart.com/"
            }
        });

        const $ = cheerio.load(response.data);
        
        // Try to find first product with price
        let price = "Price not found";
        let title = productName;
        let image = "Image not found";

        // Method 1: Look for product card
        const firstProduct = $("._2kHmtP").first();
        if (firstProduct.length > 0) {
            let priceText = firstProduct.find("._30jeq3").first().text().trim();
            if (!priceText) {
                priceText = firstProduct.find("._30jeq3._16Jk6d").first().text().trim();
            }
            if (priceText) {
                price = priceText;
            }
            
            title = firstProduct.find("._2-riNZ").first().text().trim() || 
                   firstProduct.find(".B_NuCI").first().text().trim() ||
                   productName;
            
            image = firstProduct.find("img").attr("src") || "Image not found";
        }

        // Method 2: If nothing found, search for any price text with ₹
        if (price === "Price not found") {
            const text = $.text();
            const match = text.match(/₹\s*([0-9,]+)/);
            if (match) {
                price = "₹" + match[1];
            }
        }

        console.log("Flipkart search - Title:", title, "Price:", price);
        return { website: "Flipkart", title, price, image };
    } catch (e) {
        console.error("Flipkart search error:", e.message);
        return null;
    }
}

async function scrapeSnapdealByName(productName) {
    try {
        const searchUrl = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(productName)}`;
        const response = await axios.get(searchUrl, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(response.data);
        
        let price = "Price not found";
        let title = productName;
        let image = "Image not found";

        // Method 1: Look for product card
        const firstProduct = $(".productCardImg").first().parent();
        if (firstProduct.length > 0) {
            let priceText = firstProduct.find(".discountedPriceText").first().text().trim();
            if (!priceText) {
                priceText = firstProduct.find(".payBlkBig").first().text().trim();
            }
            if (priceText) {
                price = priceText;
            }
            
            title = firstProduct.find(".productTitle").first().text().trim() || productName;
            image = firstProduct.find("img").attr("src") || "Image not found";
        }

        // Method 2: If nothing found, search for any price text
        if (price === "Price not found") {
            const text = $.text();
            const match = text.match(/₹\s*([0-9,]+)/);
            if (match) {
                price = "₹" + match[1];
            }
        }

        console.log("Snapdeal search - Title:", title, "Price:", price);
        return { website: "Snapdeal", title, price, image };
    } catch (e) {
        console.error("Snapdeal search error:", e.message);
        return null;
    }
}

// =============== START SERVER ===============
app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
