import express from 'express';

const app= express();
const PORT =process.env.PORT ?? 8000

app.use(express.json())


app.get('/',(req, res) =>{
    console.log(`Server is running.....`); 
      
})


app.listen(PORT,() => {
    console.log(`Server is running on PORT ${PORT}`);
    
})