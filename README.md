# ContactEase

ContactEase is a modern web application for managing business card contacts efficiently. It allows users to scan business cards, extract contact information using OCR, and manage their contacts with ease.

## Features

- **Business Card Scanning**: Upload images of business cards and extract contact information automatically
- **Multi-language Support**: Supports English, Hindi, and Marathi languages
- **Contact Management**: Edit, save, and organize extracted contact information
- **Import/Export**: Import and export contacts via CSV files
- **Mobile Responsive**: Fully responsive design that works on all devices
- **PWA Support**: Install as a Progressive Web App for offline access
- **History Management**: View and manage previously scanned business cards

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **OCR**: Tesseract.js for text recognition
- **State Management**: React Hooks
- **PWA**: Service Workers for offline functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/BHARTIYAYASH/ContactEase.git
   cd ContactEase
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Usage

1. Navigate to the Business Card scanner page
2. Upload a business card image (supports PNG, JPG, JPEG formats)
3. Select the language of the business card
4. Wait for the OCR processing to complete
5. Edit the extracted information if needed
6. Save the contact to your history
7. Export contacts as needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tesseract.js for OCR capabilities
- Shadcn UI for beautiful UI components
- Next.js team for the amazing framework