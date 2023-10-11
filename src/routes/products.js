import express from 'express';
import fs from 'fs';
import { io } from '../app.js';

const productsRouter  = express.Router();


productsRouter.post('/', (req, res) => {

    let id=Date.now().toString();

    const {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
    } = req.body;

    if (
        !title || !description || !code || !price || !status || !stock || !category
        ){
        return res.status(400).json({ error: 'Campos obligatorios faltantes' });
        }

    const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf-8'));

    const existingProduct = products.find((p) => p.code === code);
    if (existingProduct) {
        return res.status(400).json({ error: 'Ya existe un producto con el mismo código' });
    }

    const newProduct = {
        id: Date.now().toString(),
        title,
        description,
        code,
        price,
        status : true,
        stock,
        category,
        thumbnails,
    };
    products.push(newProduct);

    fs.writeFileSync('src/data/products.json', JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
    io.emit('productList', products);
  });

  
productsRouter.get('/', (req, res) => {
  try {

    const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf-8'));
    res.json(products);
  } catch (error) {

    res.status(500).json({ error: 'Error al leer products.json' });
  }
});

productsRouter.get('/:pid', (req, res) => {
  const productId = req.params.pid;
  const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf-8'));
  const product = products.find((p) => p.id === productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});


productsRouter.put('/:pid', (req, res) => {
    try {
      const productId = req.params.pid;
      const updatedProductData = req.body;
  
      let products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf-8'));
  
      const existingProduct = products.find((p) => p.id === productId);
  
      if (existingProduct) {
        Object.assign(existingProduct, updatedProductData);
  
        fs.writeFileSync('src/data/products.json', JSON.stringify(products, null, 2));
  
        res.json(existingProduct);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar producto:' });
    }
  });
  
  productsRouter.delete('/:pid', (req, res) => {
    try {
      const productId = req.params.pid;

      let products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf-8'));
  
      const productIndex = products.findIndex((p) => p.id === productId);
  
      if (productIndex !== -1) {
        products.splice(productIndex, 1);
        
        fs.writeFileSync('src/data/products.json', JSON.stringify(products, null, 2));
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  });

export default productsRouter;