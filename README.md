# Stock Sync

Stock Sync is a smart inhouse grocery inventory management web app built for a college project. It helps households and shared flats track grocery stock, low-stock alerts, expiry status, and shared expenses.

## Features

- Login and signup with Firebase Authentication
- User-specific inventory and expense data with Firestore
- Real-time sync across devices
- Inventory filters by search, category, status, and sort mode
- Low-stock, expiring, and fresh item alerts
- Expense tracking with per-person breakdown
- CSV export for inventory
- JSON backup export and import

## Run Locally

1. Install Node.js.
2. Open this project folder in a terminal.
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Project Files

- `index.html` - landing page
- `login.html` - login and signup page
- `dashboard.html` - main inventory, expenses, alerts, backup, and CSV UI
- `auth.js` - Firebase Authentication functions
- `data.js` - Firestore sync and data operations
- `filter.js` - search, filter, sort, and summary helpers
- `validate.js` - form validation helpers
- `backup.js` - JSON backup import/export
- `server.js` - local Express server
- `style.css` - shared styling

## Notes

Firebase configuration is currently kept in the frontend files because this is a browser-based college project. Production apps should also configure Firestore security rules carefully and avoid relying only on frontend validation.
