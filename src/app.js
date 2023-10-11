import express from 'express';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import expressHandlebars from 'express-handlebars';


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'));
  res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'));
  res.render('realtimeProducts', { products });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado');
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'));
  io.emit('productList', products);
});

server.listen(port, () => {
  console.log(`Servidor escuchando el puerto: ${port}`);
});

export { io }; 