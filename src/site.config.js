// ─────────────────────────────────────────────────────────────
//  SITE-WIDE SETTINGS (contact, RERA & form details mirror Luxura Habitat)
// ─────────────────────────────────────────────────────────────
module.exports = {
  siteName: 'Concorde Projects',
  domain: 'https://www.concordeprojects.in',        // TODO: confirm the live domain (no trailing slash)
  partnerName: 'Narayanan Rajesh',                  // RERA-registered facilitator operating the site
  brandLine: '',                                    // optional extra footer line (left blank on purpose)
  agentReraKA: 'PRM/KA/RERA/1251/310/AG/170823/000045',
  agentReraTN: 'TN/Agent/0082/2024',
  phone: '+918438344093',
  phoneDisplay: '+91 84383 44093',
  whatsapp: '918438344093',
  email: 'projectinfoindia@gmail.com',
  officeAddress: 'Bengaluru, Karnataka, India',
  zendeskKey: '86305e35-2ef4-45f7-a9e8-2aba11189ef9',  // Zendesk chat widget (same as Luxura). Set '' to disable.
  gaId: 'G-4VD9RSVKTV',                             // Google Analytics 4 measurement ID (same as Luxura). Set '' to disable.

  // Lead forms → Web3Forms (same access keys as the Luxura project pages, so leads land in the same inbox)
  formEndpoint: 'https://api.web3forms.com/submit',
  formKeys: {
    default: '386dec76-6d23-495d-b515-9e183de1283d',
    'concorde-mayfair': '386dec76-6d23-495d-b515-9e183de1283d',
    'concorde-neo': 'c6eda406-8588-421e-af25-461743b3179e',
    'concorde-sienna': 'e00eb13b-f1a4-49cc-ac16-33e6b4ca8dcb',
  },
  year: 2026,
};
