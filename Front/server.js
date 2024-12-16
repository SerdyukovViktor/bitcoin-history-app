const express = require('express');
const path = require('path');
const app = express();
const PORT = 80;

app.use(express.static(path.join(_dirname, 'public')));

app.listen(PORT, () => {
    console.log(`FRONTEND server listening on PORT: ${PORT}`);
});