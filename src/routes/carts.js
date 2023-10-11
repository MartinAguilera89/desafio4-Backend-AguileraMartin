import express from 'express';
import fs from 'fs';
import { io } from '../app.js';

const cartsRouter = express.Router();

const carts =[]

cartsRouter.post('/', (req, res) => {
    try {

      const newCartId = Date.now().toString();
  
    const newCart = {
      id: newCartId,
      products: [],
    };
      
      let carts;

      try {
      carts = JSON.parse(fs.readFileSync('src/data/carts.json', 'utf-8'));
    } catch (readError) {
        res.status(500).json({ error: 'Error interno del servidor al leer carts.json' });
        return;
      }
      carts.push(newCart);

      try {
      fs.writeFileSync('src/data/carts.json', JSON.stringify(carts, null, 2));
    } catch (writeError) {
        res.status(500).json({ error: 'Error interno del servidor al escribir en carts.json' });
        return;
      }
      res.status(201).json(newCart);
      io.emit('cartCreated', newCart);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear un carrito' });
    }
  });
  
    cartsRouter.get('/:cid', (req, res) => {

      const cartId = req.params.cid;
      const carts = JSON.parse(fs.readFileSync('src/data/carts.json', 'utf-8'));
      const cart = carts.find((c) => c.id === cartId);
      if (cart) {
        res.json(cart.products);
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    });
    
    cartsRouter.post('/:cid/product/:pid', (req, res) => {

      const cartId = req.params.cid;
      const productId = req.params.pid;
      const carts = JSON.parse(fs.readFileSync('src/data/carts.json', 'utf-8'));
      const cart = carts.find((c) => c.id === cartId);
      if (cart) {

        const existingProduct = cart.products.find((p) => p.product === productId);
        if (existingProduct) {

          existingProduct.quantity++;
        } else {

          cart.products.push({ product: productId, quantity: 1 });
        }
        fs.writeFileSync('src/data/carts.json', JSON.stringify(carts, null, 2));
        res.status(200).json(cart.products);
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    });
    
    export default cartsRouter;
    