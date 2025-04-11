// server.js
import otpRoutes from './routes/otpRoutes.js'
import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const PORT = 8000;

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.use('/',otpRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
