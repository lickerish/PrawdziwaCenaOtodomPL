// ==UserScript==
// @name         PrawdziwaCenaOtodomPL: Otodom.pl
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show total monthly rent including czynsz on Otodom.pl listings
// @author       lickerish
// @match        https://www.otodom.pl/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        .total-badge {
            display: inline-block;
            margin-top: 4px;
            padding: 2px 10px;
            border-radius: 20px;
            background-color: #e6f4ea;
            color: #000;
            font-weight: bold;
            font-size: 14px;
            border: 1px solid #c4e2cc;
        }
        .total-badge::before {
            content: "✔ ";
            color: #1e8e3e;
        }
        .unknown-badge {
            display: inline-block;
            margin-top: 4px;
            padding: 2px 10px;
            border-radius: 20px;
            background-color: #fff3cd;
            color: #856404;
            font-weight: bold;
            font-size: 14px;
            border: 1px solid #ffeeba;
        }
        .unknown-badge::before {
            content: "⚠️";
            color: #856404;
        }
    `;
    document.head.appendChild(style);

    function extractPrices(text) {
        const match = text.match(/(\d+)\s*zł\s*\+[\s\S]*?czynsz:\s*(\d+)\s*zł/);
        if (match) {
            return {
                base: parseInt(match[1], 10),
                czynsz: parseInt(match[2], 10)
            };
        }
        return null;
    }

    function updateListings() {
        const listings = document.querySelectorAll('[data-cy="listing-item"]');

        listings.forEach(listing => {
            const priceNode = listing.childNodes[0]?.childNodes[1]?.childNodes[0];
            if (!priceNode) return;

            // Prevent duplicates
            if (listing.querySelector('.total-badge') || listing.querySelector('.unknown-badge')) return;

            const fullText = listing.innerText;
            const prices = extractPrices(fullText);

            const badge = document.createElement('div');

            if (prices) {
                const total = prices.base + prices.czynsz;
                badge.className = 'total-badge';
                badge.textContent = `${total} zł/msc`;
            } else {
                badge.className = 'unknown-badge';
                badge.textContent = ` brak danych`;
            }

            priceNode.childNodes[0].appendChild(badge);
        });
    }

    // Initial run
    updateListings();

    // Rerun on page changes
    const observer = new MutationObserver(updateListings);
    observer.observe(document.body, { childList: true, subtree: true });
})();