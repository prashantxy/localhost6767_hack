import { Router } from "express";
import { askMemoryLens } from "../assistant";


const router = Router();



router.post("/query", async(req,res)=>{


  try {

    const { query } = req.body;


    if(!query){

      return res.status(400).json({
        error:"Query required"
      });

    }


    const result =
      await askMemoryLens(query);



    res.json(result);


  } catch(err){


    console.error(err);


    res.status(500).json({
      error:"Assistant failed"
    });


  }


});


export default router;