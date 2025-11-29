import express from 'express';
import 'dotenv/config';
import userRouter from './router/user.router.js';
import { authenticationMiddleware } from './middleware/auth.middleware.js';
import urlRouter from './router/url.router.js'

const app = express();
const PORT = process.env.PORT ?? 8000;

// Must be before routes
app.use(express.json());
//middleware
app.use(authenticationMiddleware)

// Root route must send a response
app.get('/', (req, res) => {
  console.log('Server is running.....');
  res.send('API Working');   // 👈 Must add this
});


app.use('/user', userRouter);
app.use(urlRouter)

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
