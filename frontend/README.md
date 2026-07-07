# 404 Project Not Found: The Frontend Saga

Welcome to the frontend of the **Epic Studio** application! Built with Next.js 14, React, Tailwind CSS, and Zustand, this interface provides an ultra-premium glassmorphism Kanban board and an interactive Annotation Studio.

## The Villains We Faced

1. **The Tyranny of State Management (and Optimistic UI)**:
   - **The Villain**: Updating the Kanban board after a drag-and-drop required waiting for the backend response. This introduced terrible latency, making the UI feel sluggish and unresponsive.
   - **The Heroic Solution**: We called upon **Zustand** to orchestrate our state. We implemented *Optimistic UI updates*, immediately updating the task's column in the client memory before the API call finishes. If the backend fails, our `useTaskStore` catches the error and flawlessly rolls back the state to its previous form, saving the user experience!

2. **The Labyrinth of SVGs and Canvas Coordinates**:
   - **The Villain**: The Annotation Studio required drawing polygons over images of various sizes and aspect ratios. Hardcoding pixel values meant annotations would break on different screen sizes or when the window was resized.
   - **The Heroic Solution**: We abandoned pixels entirely. By utilizing the `getBoundingClientRect()` API on our SVG canvas container, we translated every mouse click into a **percentage** (0-100% for both X and Y). Now, whether you view the image on a massive 4K monitor or a tiny laptop, the polygons scale flawlessly using CSS and SVG's relative positioning.

3. **The Guardian of Routes (Authentication)**:
   - **The Villain**: Unauthenticated users trying to sneak into the Kanban board or Annotation Studio.
   - **The Heroic Solution**: We forged the `useAuthStore` to securely hold our token and act as the gatekeeper. We built a beautiful Login page and sprinkled client-side route protection `useEffect` hooks across our application. Now, any rogue user is swiftly redirected to the login gate.

## Setup and Installation

### Prerequisites
- **Node.js Version:** v18.17.0 or higher (Tested on Node v20+)
- **Package Manager:** npm

### Running the Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```
   *Note: If you encounter Windows EPERM permission errors while installing, clean your npm cache or run as Administrator. We faced this villain during initial setup, but standard local dev workflows prevailed.*

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   
4. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   
5. **Demo Credentials:**
   Log in using the demo account:
   - **Email:** `demo@epic.com`
   - **Password:** `Warrior123!`
