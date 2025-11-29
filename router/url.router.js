import express from 'express';
import { shortenPostRequestBodySchema } from '../validation/request.validation.js';
import {db} from '../db/index.js'
import {urlsTable} from '../model/index.js';
import { nanoid } from 'nanoid';
import { ensureAuthenticated } from '../middleware/auth.middleware.js';
import { eq } from 'drizzle-orm';

const router =express.Router();


router.post('/shorten',ensureAuthenticated,async function (req,res) {
    const validationResult =await shortenPostRequestBodySchema.safeParseAsync(req.body);

    if(validationResult.error){
        return res.status(400).json({error:validationResult.error})
    }

    const  {url,code} =validationResult.data;

    const  shortCode =code ?? nanoid(6)

    const [result]=await db.insert(urlsTable).values({
        shortCode,
        targetURL:url,
        userId:req.user.id,
        
    }).returning({id:urlsTable.id,
        shortCode:urlsTable.shortCode,
        targetURL:urlsTable.targetURL
    });
    return res
        .status(201)
        .json({id:result.id,
            shortCode:result.shortCode,
            targetURL:result.targetURL
        })
    
})


router.get('/:shortcode',async function (req,res) {
    const code =req.params.shortcode;
    const [result] =await db.select({targetURL:urlsTable.targetURL}).from(urlsTable).where(eq(urlsTable.shortCode,code))

    if(!result ){
        return res.status(404).json({error:'Invalid URL'})
    }

    return res.status(404).json({error:"Invalid URL"})
})



export default router;