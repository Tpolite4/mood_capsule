/*
Created a local server due to the fact that the scripts listed in index.html will cause a CORs error which requires you to host the index.html locally. 

Very simple setup, you would need to install node and start the server.mjs file

    npm install node
    node server.mjs
*/

import express from "express";

const app = express();
const port = 3000;

app.use(express.static('src'));

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});