# FinanceFlow - Smart Personal Finance & Debt Ledger

An aesthetic, minimal, and modern personal finance tracker built specifically for tracking **Income**, **Expenses**, **Money Lent (Loans Given)**, **Money Borrowed (Debts & Loans Taken)**, **Interest & EMI Calculator**, and seamless **Google Firebase Firestore** cloud synchronization with local storage fallback.

---

## 🌟 Key Features

### 1. 💰 Income Tracker
- Record income with amount, source category, custom source name, date, payment mode (UPI / Cash / Bank / Cheque), and notes.
- Categories supported: **Salary**, **Business / Shop**, **Freelance**, **Rental Income**, **Agriculture**, **Interest Earned**, **Gift / Bonus**, and **Custom Source**.
- Multi-dimensional filters (search query, category filter, month/year filter) & one-click CSV export.

### 2. 💸 Expense Tracker
- Record expenses with amount, category, custom category, date, payment mode (UPI / Cash / Bank / Card), and notes.
- Categories supported: **Food & Groceries**, **Utilities & Bills**, **Fuel & Transport**, **Shopping**, **Health & Medical**, **Rent**, **Education**, **Entertainment**, and **Custom Category**.
- **In-Hand Cash Calculation**: Real-time computation of `In-Hand Balance = Total Income - Total Expenses`.
- **Visual Analytics**: Interactive Donut chart breakdown with 1-click toggle between **Income Breakdown** and **Expense Breakdown**!

### 3. 📤 Money Lent (Loans Given)
- Keep an organized record of money given to friends, relatives, customers, or colleagues.
- Borrower name, contact number, principal amount, date given, expected return date, and monthly interest %.
- **Repayment Tracker**: Record partial or full repayments with payment method (UPI / Cash / Bank) and payment history timeline.
- **Auto Status Update**: Automatically marks records as `Pending`, `Partially Paid`, or `Fully Settled`.
- **💬 One-Click WhatsApp Reminder**: Generates a respectful reminder message and opens WhatsApp directly with pre-filled debt details!

### 4. 📥 Money Borrowed (Debts & Loans Taken)
- Record money borrowed that you need to pay back.
- Lender name, phone, amount borrowed, date taken, repayment due date, and interest rate.
- Repayment logger to keep debt records accurate and updated.
- Visual progress bar showing percentage repaid vs remaining balance.

### 5. 💵 USD & USDT Real-Time Live Converter
- **⚡ Live USDT / INR Crypto Rate**: Fetches real-time Tether (USDT) market rates in INR via CoinGecko API (auto-refreshed every 60s).
- **🌐 Central Bank USD / INR Rate**: Interbank foreign exchange rate fallback.
- **✏️ Custom P2P Rate**: Set your custom exchange rate (e.g. Binance P2P rate).
- **Bidirectional Instant Conversion**: Type Dollar amount ($) and it instantly auto-calculates Rupee amount (₹), or vice-versa!
- **1% Crypto TDS / Platform Fee deduction toggle** with net received in-hand computation.
- **Quick Dollar Chips**: `+$10`, `+$50`, `+$100`, `+$500`, `+$1,000`, `+$5,000`.
- **One-Click Transfer to Ledger**: Directly log converted amounts into Income, Expense, Money Lent, or Money Borrowed.
- **Modal Dollar Inputs**: Quick `[ 💵 Enter in USD/USDT ]` toggle inside Income, Expense, Lent, and Borrowed forms for instant automatic conversion on the fly.

### 6. 🧮 Multi-Mode Interest & EMI Calculator
- **🌾 Monthly Loan Rate (e.g., ₹2 / ₹3 per ₹100 per month)**:
  - Calculates exact monthly interest, total interest for X months and Y days, daily rate, and total payable amount.
- **📈 Simple Interest (SI)**: $P \times R \times T / 100$
- **🔄 Compound Interest (CI)**: Annual, Half-Yearly, Quarterly, or Monthly compounding.
- **🏦 Loan EMI Calculator**: Monthly EMI installment and total interest breakdown.
- **One-Click Apply**: Directly sends the calculated amount and interest rate into the *Money Lent* or *Money Borrowed* form!

### 7. ☁️ Google Firebase Firestore Cloud Sync
- **Dual Mode**: Works 100% offline using secure browser LocalStorage by default, zero setup required.
- **Cloud Sync**: Enter your Firebase configuration in the Settings Modal to enable instant real-time sync with Google Cloud Firestore (`incomes`, `expenses`, `lent_records`, `borrowed_records`).
- **Batch Upload & Download**: Easily sync existing local records to Firebase or restore them from the cloud in 1 click.
- Built-in step-by-step setup guide for creating a free Firebase project.

### 7. 🎨 Aesthetic & Minimal Design
- Modern typography (`Plus Jakarta Sans` and `Outfit` via Google Fonts).
- Dual theme support (**Deep Midnight Dark Mode** & **Clean Paper Light Mode**).
- Glassmorphic card styling, subtle ambient gradients, and smooth micro-animations.
- **Export & Backup**: Export reports to **CSV** (Excel/Sheets ready) and download full **JSON** backups.

---

## 🚀 How to Run Locally

### Option 1: Using the Included Ruby Server
Open a terminal in this directory and run:
```bash
ruby server.rb
```
Then visit **`http://localhost:8080/`** in any web browser.

### Option 2: Direct Browser Open
Simply double-click `index.html` to open it in Chrome, Safari, Edge, or Firefox.

---

## 📂 Project Structure
- `index.html`: Complete UI structure with semantic tabs, modals, and responsive layout.
- `style.css`: Clean modern CSS styling with theme tokens, glassmorphism, and responsive breakpoints.
- `app.js`: Core ledger calculations, interest computation, chart drawing, and local storage state management.
- `firebase-service.js`: Modular Google Firebase v10 Firestore integration bridge.
- `server.rb`: Lightweight WEBrick local web server script.
