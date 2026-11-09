const { escapeHtml } = require('./components');
const offers = require('../offers.config');
function thankYouButton() {
  return `<a class="save-clear thank-you-link" data-thank-you href="${escapeHtml(offers.thankYouUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Say thanks with an optional $20 on Cash App">Say thanks · $20 ↗</a>`;
}
module.exports = { thankYouButton };
