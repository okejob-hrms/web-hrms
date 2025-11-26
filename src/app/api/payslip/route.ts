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

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() === "document") req.continue();
      else req.abort();
    });

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const arrayBuffer: ArrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;

    return new Response(arrayBuffer, {
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
