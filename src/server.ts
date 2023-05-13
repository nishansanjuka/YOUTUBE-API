import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import urlquery from 'url';
import ytdl from 'ytdl-core';

const app = express();

app.use(cors());

dotenv.config()

async function Verify(req: any):Promise<boolean>{
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer" && req.headers.authorization.split(" ")[1] === process.env.ACCESS_TOKEN) {
        return true;
    }
    else {
        return false;
    }
}

const Download =  async (videoId:string) => {
    return await new Promise(async(resolve:any,reject:any) => {
        const chunks = [];
        const videoTitle = videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const stream = ytdl(videoUrl, { filter: 'audioonly' })
        stream.on('data', async (chunk) => {
            chunks.push(chunk);
        });
        
        stream.on('end', () => {
            var buffer = Buffer.concat(chunks);
            resolve(buffer)
            buffer = null;
        });
        stream.on('finish', () => {
            console.log("Done Downloaded!");
        });
        stream.on('error', (error) => {
            reject(error)
        });
    })
}


app.get("/get-mp3" ,async(req:any,res:any) => {
    const is_verifyed:boolean = await Verify(req);
    if(is_verifyed){
        const youtube_url:string = req.query.youtube;
        if(youtube_url)
        {
            try
            {
                const videoId = urlquery.parse(youtube_url , true).query.v;
                if(videoId) {
                    const mp3_buffer = await Download(videoId.toString());
                    console.log(mp3_buffer);
                    res.json("yes...");
                }
                else
                {
                    res.status(406).json("didn't recognice as a youtube url!");
                }
            }
            catch(e)
            {
                console.error(e.message);
                res.status(500).json(e.message);
            }
        }
        else
        {
            res.status(406).json("Un supported URL")
        }
    }
    else
    {
        res.status(401).json("Unauthorized!")
    }
})

app.listen(5252,() => {
    console.log("The server is started listening on PORT 5252")
})
