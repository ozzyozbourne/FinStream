# FinStream Frontend

A modern React.js frontend application for FinStream, built with TypeScript and designed to replicate the Yahoo Finance experience with a dark theme.

## 🚀 Features

- **Dark Theme**: Modern dark UI matching the provided design
- **Responsive Design**: Mobile-first approach with breakpoints for all screen sizes
- **Component-Based Architecture**: Modular components for easy maintenance and team collaboration
- **TypeScript**: Full type safety throughout the application
- **Mock Data**: Realistic financial data for development and testing
- **Reusable Components**: DRY principle with shared UI components

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/           # Main layout components
│   │   ├── Header/       # Top navigation with logo and search
│   │   ├── SecondaryNav/ # Secondary navigation bar
│   │   └── MainLayout/   # Overall page wrapper
│   ├── sections/         # Page sections
│   │   ├── FeaturedArticle/  # Large featured article
│   │   ├── NewsFeed/     # News articles feed
│   │   ├── MarketSummary/    # Market indices and data
│   │   ├── Portfolio/    # User portfolio section
│   │   ├── TopGainers/   # Top performing stocks
│   │   └── LatestNews/   # Latest news sidebar
│   └── ui/              # Reusable UI components
│       ├── SearchBar/    # Search input component
│       ├── ArticleCard/  # Article display component
│       ├── StockTicker/  # Stock price display
│       ├── MarketIndex/  # Market index component
│       ├── SparklineChart/ # Mini charts
│       └── Button/       # Button component
├── pages/
│   └── HomePage/        # Main landing page
├── types/
│   └── index.ts         # TypeScript interfaces
├── utils/
│   └── mockData.ts      # Mock data for development
└── styles/
    └── global.css       # Global CSS variables
```

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **CSS Modules** for component styling
- **React Router DOM** for navigation
- **Mock Data** for development

## 🎨 Design System

### Colors
- **Primary**: #00d4aa (Teal green)
- **Background**: #0a0a0a (Dark background)
- **Secondary Background**: #111 (Card backgrounds)
- **Text**: #fff (Primary), #ccc (Secondary), #888 (Muted)
- **Borders**: #333 (Default), #00d4aa (Accent)

### Components
- **Responsive Grid System**: CSS Grid and Flexbox
- **Consistent Spacing**: 4px, 8px, 12px, 16px, 20px, 24px
- **Border Radius**: 4px, 6px, 8px, 12px
- **Typography**: System fonts with consistent weights

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## 🧩 Component Usage

### Layout Components
```tsx
import { MainLayout, Header, SecondaryNav } from './components';

// Wrap your pages with MainLayout
<MainLayout>
  <YourPageContent />
</MainLayout>
```

### UI Components
```tsx
import { SearchBar, ArticleCard, StockTicker } from './components';

// Search bar
<SearchBar 
  placeholder="Search for stocks" 
  onSearch={(query) => console.log(query)} 
/>

// Article card
<ArticleCard 
  article={articleData} 
  variant="featured" 
  onClick={() => console.log('clicked')} 
/>

// Stock ticker
<StockTicker 
  ticker={stockData} 
  showChange={true} 
/>
```

### Section Components
```tsx
import { MarketSummary, NewsFeed, TopGainers } from './components';

// Use sections directly in your pages
<MarketSummary />
<NewsFeed />
<TopGainers />
```

## 📊 Mock Data

The application includes comprehensive mock data in `src/utils/mockData.ts`:

- **Articles**: News articles with titles, descriptions, sources, timestamps
- **Market Indices**: S&P 500, Dow 30, Nasdaq, etc. with sparkline data
- **Stocks**: Top gainers with price and change data
- **Navigation**: Menu items and routing data

## 🎯 Key Features

### 1. Modular Architecture
- Each component is self-contained with its own CSS
- Easy to work on independently by team members
- Minimal merge conflicts due to separate files

### 2. Type Safety
- Full TypeScript coverage
- Defined interfaces for all data structures
- Compile-time error checking

### 3. Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions

### 4. Performance
- Optimized component structure
- CSS-only animations where possible
- Efficient re-rendering

## 🔧 Development Guidelines

### Component Structure
Each component follows this structure:
```
ComponentName/
├── ComponentName.tsx    # Main component
├── ComponentName.css    # Component styles
└── index.ts            # Export file
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ArticleCard`)
- **Files**: PascalCase for components, camelCase for utilities
- **CSS Classes**: kebab-case (e.g., `article-card`)
- **Props**: camelCase (e.g., `showChange`)

### CSS Guidelines
- Use CSS custom properties for consistent theming
- Mobile-first responsive design
- BEM-like naming for complex selectors
- Component-scoped styles to prevent conflicts

## 🚀 Future Enhancements

- [ ] API integration for real-time data
- [ ] User authentication and portfolio management
- [ ] Advanced charting with real data
- [ ] Push notifications for price alerts
- [ ] Dark/light theme toggle
- [ ] PWA capabilities
- [ ] Unit and integration tests

## 👥 Team Development

This architecture is designed for team collaboration:

1. **Independent Development**: Each component can be worked on separately
2. **Clear Interfaces**: TypeScript interfaces define component contracts
3. **Consistent Structure**: Same file organization across all components
4. **Minimal Dependencies**: Components have few external dependencies
5. **Easy Testing**: Isolated components are easier to test

## 📝 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## 🤝 Contributing

1. Create feature branches for new components
2. Follow the established component structure
3. Add TypeScript interfaces for new data types
4. Update mock data as needed
5. Test responsive design across breakpoints
6. Ensure accessibility compliance

## 📄 License

This project is part of the FinStream application. See the main project LICENSE for details.