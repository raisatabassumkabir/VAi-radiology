# 404 Project Not Found: The Backend Saga

Welcome to the backend of the **Epic Studio** task management and annotation application. This Django-powered beast is the core of our operations, serving up a strict REST API, managing robust token authentication, and gracefully handling percentage-based polygon arrays.

## The Villains We Faced

Every epic saga has its villains, and this one was no exception:

1. **The Phantom of CORS**: 
   - **The Villain**: Modern browsers hate it when a frontend at `localhost:3000` tries to talk to a backend at `localhost:8000`. The browser unleashed the dreaded CORS policy error, blocking all requests.
   - **The Heroic Solution**: We recruited the `django-cors-headers` middleware. By enlisting it in our `settings.py` and granting explicit safe-passage to `http://localhost:3000`, we defeated the CORS phantom with the power of proper HTTP headers.

2. **The Curse of the Unparsed Date**:
   - **The Villain**: The Kanban board requires filtering tasks by date (YYYY-MM-DD). The villain was the unpredictable nature of query string parameters, which could be malformed, missing, or utterly chaotic, leading to 500 Internal Server Errors.
   - **The Heroic Solution**: We armed our `TaskViewSet` with a robust `try-except` block and `datetime.strptime`. We cast a custom DRF `ValidationError` spell to gracefully return an HTTP 400 with a clear message, saving the server from crashing.

3. **The Enigma of Authentication**:
   - **The Villain**: The client demanded "Email and Password" login, but Django's default authentication system expects a strict `username`. Modifying the base `User` model to use email as the primary identifier is a treacherous path filled with boilerplate traps.
   - **The Heroic Solution**: Instead of rewriting the fundamental laws of Django users, we created a custom `LoginView` using `APIView`. This view accepts an email, looks up the corresponding user, verifies the password, and summons a `rest_framework.authtoken`—achieving the client's request without a drop of unnecessary boilerplate!

## Setup and Installation

### Prerequisites
- **Python Version:** 3.10+ (Built and tested on Python 3.10.x)
- **Database:** SQLite (default Django configuration)

### Running the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install django djangorestframework django-cors-headers pillow
   ```

4. **Run Database Migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create the Demo User:**
   We've forged a custom management command to spawn our hero.
   ```bash
   python manage.py setup_demo_user
   ```
   *This creates the user: `demo@epic.com` with password: `Warrior123!`*

6. **Start the Development Server:**
   ```bash
   python manage.py runserver 8000
   ```
   The API will be available at `http://localhost:8000/api/`
