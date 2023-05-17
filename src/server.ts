import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import urlquery from 'url';
import ytdl from 'ytdl-core';
import {Readable} from 'stream';

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
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    const stream = ytdl(videoUrl, { filter: 'audioonly' });
                    const getContentLength = new Promise((resolve:any,reject:any) => {
                        stream.on('response', (response) => {
                            const contentLength = response.headers['content-length'];
                            resolve(contentLength as number);
                          });
                    })
                    const contentLength = await getContentLength;
                    res.setHeader('Content-Length', contentLength);
                    res.setHeader('Content-Type', 'aduio/webm');
                    stream.pipe(res);
                    stream.on('finish', () => {
                        console.log("Done Downloaded!");
                    });
                    stream.on('error', (error) => {
                        console.log({error})
                    });
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
        console.log("hey Unauthorized!!! and acces token is " , process.env.ACCESS_TOKEN)
        res.status(401).json({msg:"Unauthorized!" , at:process.env.ACCESS_TOKEN})
    }
})

app.listen(5252,() => {
    console.log("The server is started listening on PORT 5252")
})
