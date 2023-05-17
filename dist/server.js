"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const url_1 = __importDefault(require("url"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
dotenv_1.default.config();
function Verify(req) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer" && req.headers.authorization.split(" ")[1] === process.env.ACCESS_TOKEN) {
            return true;
        }
        else {
            return false;
        }
    });
}
app.get("/get-mp3", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const is_verifyed = yield Verify(req);
    if (is_verifyed) {
        const youtube_url = req.query.youtube;
        if (youtube_url) {
            try {
                const videoId = url_1.default.parse(youtube_url, true).query.v;
                if (videoId) {
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    const stream = (0, ytdl_core_1.default)(videoUrl, { filter: 'audioonly' });
                    const getContentLength = new Promise((resolve, reject) => {
                        stream.on('response', (response) => {
                            const contentLength = response.headers['content-length'];
                            resolve(contentLength);
                        });
                    });
                    const contentLength = yield getContentLength;
                    res.setHeader('Content-Length', contentLength);
                    res.setHeader('Content-Type', 'aduio/webm');
                    stream.pipe(res);
                    stream.on('finish', () => {
                        console.log("Done Downloaded!");
                    });
                    stream.on('error', (error) => {
                        console.log({ error });
                    });
                }
                else {
                    res.status(406).json("didn't recognice as a youtube url!");
                }
            }
            catch (e) {
                console.error(e.message);
                res.status(500).json(e.message);
            }
        }
        else {
            res.status(406).json("Un supported URL");
        }
    }
    else {
        console.log("hey Unauthorized!!! and acces token is ", process.env.ACCESS_TOKEN);
        res.status(401).json({ msg: "Unauthorized!", at: process.env.ACCESS_TOKEN });
    }
}));
app.listen(5252, () => {
    console.log("The server is started listening on PORT 5252");
});
