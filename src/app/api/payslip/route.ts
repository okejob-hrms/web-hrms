export const runtime = "nodejs";

import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const { html } = await req.json();
    if (!html) return new Response("HTML not provided", { status: 400 });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // ❌ Disable ALL external resources (biar tidak pending)
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      // Only allow document itself
      if (req.resourceType() === "document") {
        req.continue();
      } else {
        req.abort();
      }
    });

    // Load HTML → FAST mode
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 0, // disable timeout
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=payslip.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("PDF Error:", err);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
