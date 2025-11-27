// backend/routes/post.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/posts', postController.list);
router.post('/posts', postController.create);
router.get('/posts/:id', postController.getById);
router.delete('/posts/:id', postController.remove);

module.exports = router;
