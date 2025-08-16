# 🧑‍💻 BroCode – Collaborative Code Editor with Group Chat

BroCode is a real-time collaborative coding platform that lets users join groups, write and compile code together, and chat — all in a modern, responsive interface. Ideal for group coding sessions, interview prep, or collaborative projects.

## 🚀 Features

- 🔐 **User Authentication** – Secure signup/login with session handling.
- 👥 **Group System** – Create or join password-protected coding groups.
- 💻 **Real-Time Collaborative Editor** – Built with Monaco + Yjs for multi-user editing.
- ⚙️ **Live Code Compilation** – Supports C++, Python, and JavaScript; shows output and errors.
- 💬 **Real-Time Chat** – Chat with group members in real-time.
- 💾 **Auto-Save & Code History** – Code is saved and retrieved automatically per group.
- 📜 **Persistent Chat History** – Previous messages are retained across sessions.
- 🌙 **Modern UI** – Clean, dark-themed, responsive frontend built with Tailwind CSS.

## 📁 Project Structure

```
BroCode/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
├── server/                  # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── README.md
```

## 🛠️ Tech Stack

### Frontend

- React.js  
- Tailwind CSS  
- Monaco Editor  
- Yjs + y-websocket for real-time code syncing  
- React Router DOM  
- Socket.IO   

### Backend

- Node.js + Express.js  
- MongoDB + Mongoose  
- JWT & Sessions  
- Socket.IO (chat handling)  
- CORS, Body-parser  

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/brocode.git
cd brocode
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT = 8000
MONGO_DB_URL = your_mongodb_url
ACCESS_TOKEN_SECRET = your_secret_key
GEMINI_API_KEY = your_gemini_api_key
GEMINI_USER_ID = 68a04a9df1ec421dc06ef707
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

### 4. Yjs WebSocket Server (for Code Sync)

If you're running your own Yjs WebSocket server:

```bash
npx y-websocket-server --port 1234
```

Or include it in your deployment setup.

## 🌐 API Endpoints

| Method | Endpoint       | Description                  |
|--------|----------------|------------------------------|
| GET    | `/protect`     | Validate session             |
| POST   | `/groups`      | Fetch user’s groups          |
| POST   | `/createGroup` | Create a new group           |
| POST   | `/joinGroup`   | Join an existing group       |
| POST   | `/getCode`     | Retrieve group's saved code  |
| POST   | `/saveCode`    | Persist group code to DB     |
| POST   | `/compile`     | Compile and return output    |
| POST   | `/logout`      | End user session             |

## 📌 Future Improvements

- Syntax-aware code suggestions  
- Admin/mod privileges in groups  
- UI themes (light/dark toggle)  

## 🙌 Developed By

**Maulik Sharma, Karnati Ravi Teja, Mihir Malve**

## 📄 License

This project is licensed under the MIT License.
