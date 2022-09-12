import puppeteer from "puppeteer";
import { v4 as uuid } from "uuid";
import { Invoice } from "../entitites/Attendee";

export async function generatePdf(html: string) {
	const browser = await puppeteer.launch({
		headless: true,
		// executablePath: "google-chrome-stable",
		// args: ["--no-sandbox", "--disable-gpu"],
	});
	const page = await browser.newPage();
	const path = `./temp/${uuid()}-invoice.pdf`;

	await page.setContent(html);
	const pdf = await page.pdf({
		path: path,
		format: "A4",
	});

	await browser.close();

	return { pdf, path };
}

export function invoice(data: Invoice, locale: string): string {
	const { issuer, payer, body } = data;
	let payerBilling;
	if (!payer.ICO) {
		payerBilling = `<p></p>`;
	} else {
		payerBilling = `<p>IČO: ${payer.ICO}, DIČ: ${payer.DIC}</p>							
        <p>IČ DPH: ${payer.ICDPH}</p> `;
	}

	return `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
                    body {
                        font-family: Roboto;
                        font-size: smaller;
                        margin: 2em;
                    }
                    .container {
                        font-family: 'Roboto', sans-serif;	
                    }
                    .header img {
                        max-width: 100px;  
                    }
                    .footer img {
                        max-width: 250px;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    td, th {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }
                    .container {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        max-width: 800px;
                        margin: auto;
                        padding: 15px;
                    }
                    .header {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                    }
                    .content {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        margin-left: 50px;
                        margin-right: 50px;
                    }
                    .footer {
                        margin-top: 15px;
                        display: flex;
                        flex-direction: row;
                        justify-content: space-around;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src=${issuer.logoUrl}>
                        <h1>${
													locale === "en"
														? "Invoice " + body.variableSymbol
														: "Faktúra " + body.variableSymbol
												}</h1>
                    </div>
                    <div class="content">
                        <div class="issuer">
                            <h2>${locale === "en" ? "Issuer" : "Vydal"}</h2>
                            <p>${issuer.billing.name}</p>
                            <p>${issuer.billing.address.street}</p>
                            <p>${issuer.billing.address.postal}, ${
		issuer.billing.address.city
	}</p>
    <p>${issuer.billing.address.country}</p>
                            <p>ICO: ${issuer.billing.ICO}, DIC: ${
		issuer.billing.DIC
	}</p>
                            <p>IC DPH: ${issuer.billing.ICDPH}</p>
                            <p>Issue Date: ${body.issueDate.toLocaleDateString(
															locale
														)}</p>
                            <p>Due Date: ${body.dueDate.toLocaleDateString(
															locale
														)}</p>
                            <p>VAT Date: ${body.vatDate.toLocaleDateString(
															locale
														)}</p>
                            <strong>${
															locale === "en"
																? "Bank connection"
																: "Bankové spojenie"
														}</strong>
                            <p>IBAN: ${issuer.billing.IBAN}</p>
                            <p>SWIFT: ${issuer.billing.SWIFT}</p>
                            <p>Form of payment: ${body.type}</p>
                        </div>
                        <div class="payer">
                            <h2>${locale === "en" ? "Payer" : "Platca"}</h2>
                            <p>${payer.name}</p>
                            <p>${payer.address.street}</p>
                            <p>${payer.address.postal}, ${
		payer.address.city
	}</p>
                            <p>${payer.address.country}</p>
							${payerBilling}
                        </div>
                    </div>
                    <p>${body.body}</p>
                    <p>${
											locale === "en"
												? "COMMENT: " + body.comment
												: "Komentár :" + body.comment
										}</p>
                    <table>
                        <tr>
                            <th>${locale === "en" ? "Item" : "Položka"}</th>
                            <th>${locale === "en" ? "Price" : "Cena"}</th>
                        </tr>
                        <tr>
                            <td>${
															locale === "en"
																? "Conference fee"
																: "Konferenčný poplatok"
														}</td>
                            <td>${body.ticketPrice} €</td>
                        </tr>
                        <tr>
                            <td>${locale === "en" ? "VAT" : "DPH"}</td>
                            <td>${body.vat} €</td>
                        </tr>
                        <tr>
                            <td>${locale === "en" ? "SUM" : "Spolu"}</td>
                            <td>${
															Number(body.ticketPrice) + Number(body.vat)
														} €</td>
                        </tr>
                    </table>
                    <div class="footer">
                        <strong>${
													locale === "en" ? "Issued By:" : "Vydal:"
												}</strong>
                        <img src=${issuer.stampUrl}>
                    </div>
                </div>
            </body>
        </html>`;
}
