import express from 'express';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import expressHandlebars from 'express-handlebars';
import path from 'path';


const app = express();
const server = http.createServer(app); // Crea un servidor HTTP
const io = new Server(server); // Crea un servidor de Socket.IO

const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Configura Handlebars como motor de plantillas
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  // Renderiza la vista home.handlebars
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8')); // Lee products.json
  res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
  // Renderiza la vista realtimeProducts.handlebars
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8')); // Lee products.json
  res.render('realtimeProducts', { products });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado');
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8')); // Lee products.json
  // Emitir la lista de productos a través de WebSocket
  io.emit('productList', products);
});

server.listen(port, () => {
  console.log(`Servidor escuchando el puerto: ${port}`);
});

export { io }; 