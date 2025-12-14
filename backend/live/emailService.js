const nodemailer = require('nodemailer');
const cron = require('node-cron');
const axios = require('axios');

// Configure transporter
let transporter;

const createTransporter = async () => {
  if (transporter) return transporter;

  // ---------------------------------------------------------
  // 1. GMAIL CONFIGURATION (For Real Emails)
  // To use Gmail:
  // 1. Go to Google Account > Security > 2-Step Verification > Enable it.
  // 2. Go to Google Account > Security > App Passwords > Create one for "Mail".
  // 3. Paste your email and the 16-character App Password below.
  // ---------------------------------------------------------
  const GMAIL_USER = "akashachintya54@gmail.com"; // <--- PUT YOUR EMAIL HERE
  const GMAIL_APP_PASSWORD = "awfe rpke arpl qzzq"; // <--- PUT YOUR APP PASSWORD HERE (Not your login password)

  if (GMAIL_USER && GMAIL_USER.includes("@") && GMAIL_APP_PASSWORD && GMAIL_APP_PASSWORD.length > 10) {
      // Use Gmail
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });
      console.log(`📧 Using Gmail: ${GMAIL_USER}`);
  } else {
      // Use Ethereal (Fallback)
      console.log('⚠️ Invalid Gmail credentials. Using Ethereal (Fake Inbox).');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
  }

  return transporter;
};

// Subscriptions Store (In-Memory for now, can be persisted to JSON)
const subscriptions = new Map(); // email -> [symbols]

const saveSubscription = (email, symbols) => {
  subscriptions.set(email, symbols);
  console.log(`Subscribed: ${email} -> ${symbols.join(', ')}`);
};

const removeSubscription = (email) => {
  subscriptions.delete(email);
  console.log(`Unsubscribed: ${email}`);
};

// Fetch news for a list of symbols
const fetchNewsForSymbols = async (symbols) => {
  if (!symbols || symbols.length === 0) return [];

  // Helper to fetch news for a single symbol using V1 Search API
  const fetchV1 = async (symbol) => {
    try {
        const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=3`;
        const response = await axios.get(url, {
             headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const news = response.data.news || [];
        return news.map(item => ({
            title: item.title,
            url: item.link,
            publisher: item.publisher,
            timestamp: item.providerPublishTime,
            summary: item.publisher,
            imageUrl: item.thumbnail?.url // Capture image
        }));
    } catch (e) {
        return [];
    }
  };

  try {
      // Since V2 batch API is unreliable, we fetch V1 news for the first 3 symbols in parallel and combine
      const topSymbols = symbols.slice(0, 3);
      const promises = topSymbols.map(s => fetchV1(s));
      const results = await Promise.all(promises);
      
      // Flatten arrays
      const allNews = results.flat();
      
      // Deduplicate by URL (in case same article appears for multiple stocks)
      const uniqueNews = Array.from(new Map(allNews.map(item => [item.url, item])).values());
      
      return uniqueNews.slice(0, 5); // Return top 5 unique articles
  } catch (error) {
    console.error('Error fetching email news:', error.message);
    return [];
  }
};

// Generate HTML Email (Dark Mode with Images)
const generateEmailHtml = (newsItems) => {
    const listItems = newsItems.map(item => `
        <tr>
            <td style="padding: 20px 0; border-bottom: 1px solid #333333;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td valign="top" style="padding-right: 15px;">
                            <h3 style="margin: 0 0 10px 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
                                <a href="${item.url}" style="color: #00e6b8; text-decoration: none;">${item.title}</a>
                            </h3>
                            <p style="margin: 0 0 10px 0; color: #888888; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${item.publisher} • ${new Date(item.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p style="margin: 0; color: #cccccc; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6;">
                                ${item.summary || 'Click to read the full story.'}
                            </p>
                        </td>
                        ${item.imageUrl ? `
                        <td width="120" valign="top">
                            <a href="${item.url}" style="text-decoration: none; display: block;">
                                <img src="${item.imageUrl}" width="120" height="80" style="display: block; border-radius: 8px; object-fit: cover; background-color: #333;" alt="News Image" />
                            </a>
                        </td>
                        ` : ''}
                    </tr>
                </table>
            </td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FinStream Daily Digest</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; -webkit-font-smoothing: antialiased;">
            <center>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #000000; width: 100%;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <!-- Main Container -->
                            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; border: 1px solid #333333; overflow: hidden; max-width: 600px; width: 100%;">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background-color: #00e6b8; padding: 30px 20px;">
                                        <h1 style="margin: 0; color: #000000; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">FinStream</h1>
                                        <p style="margin: 5px 0 0 0; color: #004d3d; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Daily Market Digest</p>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 30px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding-bottom: 20px; border-bottom: 2px solid #00e6b8;">
                                                    <h2 style="margin: 0; color: #ffffff; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 600;">Top Stories</h2>
                                                </td>
                                            </tr>
                                            ${listItems}
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="background-color: #000000; padding: 20px; border-top: 1px solid #333333;">
                                        <p style="margin: 0; color: #666666; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px;">
                                            Start your day with the market's pulse.
                                        </p>
                                        <p style="margin: 10px 0 0 0; color: #444444; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} FinStream. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </center>
        </body>
        </html>
    `;
};

// Send Daily Digest
const sendDailyDigest = async () => {
    console.log('Running Daily Digest Job...');
    const mailTransport = await createTransporter();
    const results = [];

    for (const [email, symbols] of subscriptions.entries()) {
        const news = await fetchNewsForSymbols(symbols);
        if (news.length > 0) {
            const html = generateEmailHtml(news);
            
            const info = await mailTransport.sendMail({
                from: '"FinStream Bot" <alerts@finstream.com>',
                to: email,
                subject: `FinStream Daily Digest: News for ${symbols.join(', ')}`,
                html: html,
            });

            console.log("Message sent: %s", info.messageId);
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("Preview URL: %s", previewUrl);
            results.push({ email, previewUrl });
        }
    }
    return results;
};

// Send Single Test Email (Directly)
const sendTestEmail = async (email, symbols) => {
    console.log(`Sending Test Email to ${email}...`);
    const mailTransport = await createTransporter();
    
    // Default symbols if none provided
    const targetSymbols = (symbols && symbols.length > 0) ? symbols : ['AAPL', 'TSLA', 'GOOGL'];
    const news = await fetchNewsForSymbols(targetSymbols);
    
    if (news.length === 0) {
        throw new Error('No news found for symbols');
    }

    const html = generateEmailHtml(news);
    const info = await mailTransport.sendMail({
        from: '"FinStream Bot" <alerts@finstream.com>',
        to: email,
        subject: `[TEST] FinStream Digest for ${targetSymbols.join(', ')}`,
        html: html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Test Preview URL: %s", previewUrl);
    return previewUrl;
};

// Initialize Cron Job
const initCron = () => {
    // Schedule for 8:00 AM every day
    // For demo purposes, we can also trigger it manually via API
    cron.schedule('0 8 * * *', () => {
        sendDailyDigest();
    });
    console.log('Cron job initialized: Daily Digest at 08:00 AM');
};

module.exports = {
    saveSubscription,
    removeSubscription,
    sendDailyDigest, 
    sendTestEmail,
    initCron
};
