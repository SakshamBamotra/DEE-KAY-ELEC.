# DEE KAY ELEC. - Inventory App Specification

Use this prompt to recreate the DEE KAY ELEC. application in any AI coding tool.

## 1. Project Overview
Create a mobile-first, responsive Inventory Management Web Application for an Electronics Shop using React, Tailwind CSS, and Lucide React icons. The app must persist data using `localStorage` and include AI features (Gemini) for product descriptions and insights.

## 2. Tech Stack & Style
*   **Framework:** React (Functional Components, Hooks).
*   **Styling:** Tailwind CSS (Slate color palette for UI, Emerald/Rose/Indigo for actions).
*   **Icons:** Lucide-React.
*   **Charts:** Recharts.
*   **AI:** Google Gemini API (via `@google/genai`).
*   **Layout:** Sidebar for Desktop, Bottom Navigation Bar for Mobile.

## 3. Data Model
**Product Interface:**
*   `id`: string
*   `name`: string
*   `company`: Enum (Samsung, LG, Sony, Voltas, Whirlpool, Luminous, Kent, etc.)
*   `category`: Enum (TV, AC, Fridge, Washing Machine, Inverter, Battery, Water Filter, etc.)
*   `specs`: Object (dynamic keys like `tonnage`, `capacity`, `screenSize`)
*   `price`: number
*   `stock`: number
*   `description`: string

**Transaction Interface:**
*   `type`: 'IN' (Stock Added) or 'OUT' (Product Sold)
*   `quantity`: number
*   `totalAmount`: number
*   `partyName`: string (Customer or Distributor)
*   `date`: ISO String

## 4. Key Features & Workflows

### A. Dashboard (Home)
*   **Stats Cards:** Total Items, Total Value (₹), Low Stock Alerts (Amber color).
*   **Charts:** Vertical Bar chart showing stock quantity per category.
*   **Category Order:** TV, Fridge, Washing Machine, AC, Inverter, Battery, etc.

### B. Inventory List (Main View)
*   **Step 1 (Category Grid):** Show a grid of categories (TV, AC, etc.) with item counts.
*   **Step 2 (Product List):** When a category is clicked:
    *   **Filter Bar:** Search input + Dynamic "Spec Filters" (e.g., if TV selected, show buttons for 32", 43", 55").
    *   **Grouping:** Group products by Company (Accordion style).
    *   **Row Actions:**
        *   **Stock Control:** A control with `Minus` button (Sell), `Stock Count`, and `Plus` button (Add).
        *   **Share:** WhatsApp share button with pre-filled product details.
        *   **Edit:** Edit product details.
        *   **Sold/Delete:** A button labeled **"Sold"** (Trash icon styling) that completely deletes the product from the database after a confirmation prompt ("Do you really want the product to be removed?").

### C. Stock Actions (Modals)
*   **Selling (Minus Button):**
    *   Opens a modal titled "Product Sold".
    *   **Quick Selectors:** Buttons for [1, 2, 3, 4, 5] quantity.
    *   **Custom Input:** Number input for larger quantities.
    *   **Details:** Input for Customer Name (Optional).
    *   **Important:** Do **not** show price/total fields in this mode. Just quantity and name.
*   **Restocking (Plus Button):**
    *   Opens a modal titled "Restock Item".
    *   Shows Price per Unit and Total Cost calculation.
    *   Input for Distributor Name.

### D. Transaction History
*   **Visual Logic:**
    *   **Sold Items (OUT):** Show as **Green** with a `+` sign (e.g., +₹45,000). This represents revenue/profit.
    *   **Stock Added (IN):** Show as **Grey** (Neutral). No `+` or `-` sign, or a neutral display. This represents operational restocking, not a loss.

### E. Add Product Wizard
*   **Step-by-Step Form:**
    1.  Select Brand.
    2.  Select Category.
    3.  Model Details (Name + Specific specs based on category, e.g., Tonnage for AC).
    4.  Price & Stock.
*   **AI Feature:** "Auto-Generate" button to creating a marketing description using Gemini API based on the model name and specs.

### F. AI Analyst
*   **Insights:** A tab that sends the inventory JSON to Gemini to get 3 bullet points of business advice (e.g., "Stock up on ACs before summer").
*   **Chat:** A chat interface to ask questions like "How many Samsungs do I have?".

## 5. Specific UI Requirements
*   **Font:** Inter.
*   **Mobile Experience:** Sticky bottom nav, safe-area padding.
*   **Low Stock Logic:** Highlight items with stock <= 5.