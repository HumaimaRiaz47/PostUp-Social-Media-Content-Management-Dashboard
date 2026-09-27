import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

const createPost = (formData) => API.post('/api/posts', formData);

//const getAllPosts = () => API.get('/api/posts');

 const updatePost = (id, formData) => API.put(`/api/posts/${id}`, formData);

const deletePost = (id) => API.delete(`/api/posts/${id}`);


const getPostById = (id) => API.get(`/api/posts/${id}`).then(res => res.data);
const getPosts = () => API.get('/api/posts').then(res => res.data);

export {
  createPost,
  updatePost,
  deletePost,
  getPosts, 
  getPostById
};

export default API;

